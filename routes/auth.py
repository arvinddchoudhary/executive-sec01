from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from models.database import get_db
from models.orm_models import User, Subscription
from models.schemas import UserCreate, UserOut, TokenOut, UserMeOut
from services.subscription_service import create_trial_subscription
from services.gmail_oauth_service import get_auth_url, exchange_code_for_tokens
from passlib.context import CryptContext
from jose import jwt, JWTError
from fastapi.security import OAuth2PasswordBearer
from fastapi.responses import RedirectResponse
from dotenv import load_dotenv
from datetime import datetime, timedelta
import os

load_dotenv()

router = APIRouter()
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

JWT_SECRET = os.getenv("JWT_SECRET")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", 1440))
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
ADMIN_EMAIL = "arvindchoudhary0809@gmail.com"

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

def create_token(data: dict) -> str:
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def get_current_user(token: str = Depends(oauth2_scheme), db: AsyncSession = Depends(get_db)):
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        result = await db.execute(select(User).where(User.email == email))
        user = result.scalars().first()
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

def require_role(role: str):
    async def role_checker(current_user=Depends(get_current_user)):
        if current_user.role != role and current_user.role != "admin":
            raise HTTPException(status_code=403, detail=f"Requires {role} role")
        return current_user
    return role_checker

@router.post("/register", response_model=UserOut)
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    if result.scalars().first():
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        role="admin" if user.email == ADMIN_EMAIL else (user.role or "executive"),
        onboarding_complete=True if user.email == ADMIN_EMAIL else False,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    await create_trial_subscription(new_user.id, db)
    return new_user

@router.post("/login", response_model=TokenOut)
async def login(user: UserCreate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == user.email))
    db_user = result.scalars().first()
    if not db_user or not verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_token({"sub": db_user.email, "role": db_user.role})
    return {"access_token": token, "token_type": "bearer"}

@router.get("/me", response_model=UserMeOut)
async def get_me(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(User)
        .options(selectinload(User.subscription))
        .where(User.id == current_user.id)
    )
    user = result.scalars().first()

    # Admin always bypasses onboarding
    if user.email == ADMIN_EMAIL and not user.onboarding_complete:
        user.onboarding_complete = True
        user.role = "admin"
        await db.commit()

    return user

@router.get("/gmail/connect")
async def gmail_connect(current_user=Depends(get_current_user)):
    # Pass user ID as state so callback knows which user is connecting
    auth_url, state = get_auth_url(state=str(current_user.id))
    return {"auth_url": auth_url}

@router.get("/gmail/callback")
async def gmail_callback(code: str, state: str, db: AsyncSession = Depends(get_db)):
    try:
        tokens = exchange_code_for_tokens(code)

        user_id = int(state)
        result = await db.execute(select(User).where(User.id == user_id))
        user = result.scalars().first()

        if not user:
            return RedirectResponse(url=f"{FRONTEND_URL}/login?error=user_not_found")

        user.gmail_access_token = tokens["access_token"]
        user.gmail_refresh_token = tokens.get("refresh_token")
        user.gmail_token_expiry = tokens.get("expiry")
        user.onboarding_complete = True
        await db.commit()

        return RedirectResponse(url=f"{FRONTEND_URL}/onboarding?gmail=connected")

    except Exception as e:
        print(f"OAuth callback error: {str(e)}")
        return RedirectResponse(url=f"{FRONTEND_URL}/onboarding?error=oauth_failed&detail={str(e)[:100]}")

@router.post("/gmail/disconnect")
async def gmail_disconnect(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    current_user.gmail_access_token = None
    current_user.gmail_refresh_token = None
    current_user.gmail_token_expiry = None
    current_user.onboarding_complete = False
    await db.commit()
    return {"message": "Gmail disconnected"}