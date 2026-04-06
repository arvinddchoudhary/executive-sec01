from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.orm_models import Subscription, User
from datetime import datetime
from fastapi import HTTPException

async def get_user_subscription(user_id: int, db: AsyncSession) -> Subscription:
    result = await db.execute(select(Subscription).where(Subscription.user_id == user_id))
    return result.scalars().first()

async def is_subscription_active(user_id: int, db: AsyncSession) -> bool:
    from models.orm_models import User
    user_result = await db.execute(select(User).where(User.id == user_id))
    user = user_result.scalars().first()
    if user and user.role == "admin":
        return True

    sub = await get_user_subscription(user_id, db)
    if not sub:
        return False
    if sub.status == "active":
        if sub.plan == "trial":
            if sub.trial_end and datetime.utcnow() > sub.trial_end:
                sub.status = "expired"
                await db.commit()
                return False
        return True
    return False

async def require_active_subscription(user_id: int, db: AsyncSession):
    active = await is_subscription_active(user_id, db)
    if not active:
        raise HTTPException(
            status_code=402,
            detail="Subscription expired. Please upgrade to continue using SecretaryAI."
        )

async def create_trial_subscription(user_id: int, db: AsyncSession) -> Subscription:
    from datetime import timedelta
    existing = await get_user_subscription(user_id, db)
    if existing:
        return existing
    sub = Subscription(
        user_id=user_id,
        plan="trial",
        status="active",
        trial_start=datetime.utcnow(),
        trial_end=datetime.utcnow() + timedelta(days=7),
    )
    db.add(sub)
    await db.commit()
    await db.refresh(sub)
    return sub