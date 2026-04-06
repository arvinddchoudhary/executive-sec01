from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.database import get_db
from models.orm_models import Subscription
from models.schemas import SubscriptionOut
from services.stripe_service import create_checkout_session, create_customer_portal
from services.subscription_service import get_user_subscription
from routes.auth import get_current_user
from dotenv import load_dotenv
import stripe
import os

load_dotenv()

router = APIRouter()

@router.get("/", response_model=SubscriptionOut)
async def get_my_subscription(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    sub = await get_user_subscription(current_user.id, db)
    if not sub:
        raise HTTPException(status_code=404, detail="No subscription found")
    return sub

@router.post("/checkout/{plan}")
async def create_checkout(plan: str, current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if plan not in ["monthly", "yearly"]:
        raise HTTPException(status_code=400, detail="Plan must be monthly or yearly")
    sub = await get_user_subscription(current_user.id, db)
    stripe_customer_id = sub.stripe_customer_id if sub else None
    checkout_url = create_checkout_session(current_user.email, plan, stripe_customer_id)
    return {"checkout_url": checkout_url}

@router.post("/portal")
async def billing_portal(current_user=Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    sub = await get_user_subscription(current_user.id, db)
    if not sub or not sub.stripe_customer_id:
        raise HTTPException(status_code=400, detail="No Stripe customer found")
    portal_url = create_customer_portal(sub.stripe_customer_id)
    return {"portal_url": portal_url}

@router.post("/webhook")
async def stripe_webhook(request: Request, db: AsyncSession = Depends(get_db)):
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    webhook_secret = os.getenv("STRIPE_WEBHOOK_SECRET")

    try:
        event = stripe.Webhook.construct_event(payload, sig_header, webhook_secret)
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid webhook")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        customer_email = session.get("customer_email") or session.get("customer_details", {}).get("email")
        stripe_customer_id = session.get("customer")
        stripe_sub_id = session.get("subscription")

        from models.orm_models import User
        result = await db.execute(select(User).where(User.email == customer_email))
        user = result.scalars().first()
        if user:
            sub_result = await db.execute(select(Subscription).where(Subscription.user_id == user.id))
            sub = sub_result.scalars().first()
            if sub:
                sub.status = "active"
                sub.plan = "monthly"
                sub.stripe_customer_id = stripe_customer_id
                sub.stripe_subscription_id = stripe_sub_id
                await db.commit()

    elif event["type"] == "customer.subscription.deleted":
        stripe_sub_id = event["data"]["object"]["id"]
        result = await db.execute(select(Subscription).where(Subscription.stripe_subscription_id == stripe_sub_id))
        sub = result.scalars().first()
        if sub:
            sub.status = "cancelled"
            await db.commit()

    elif event["type"] == "invoice.payment_failed":
        stripe_sub_id = event["data"]["object"].get("subscription")
        if stripe_sub_id:
            result = await db.execute(select(Subscription).where(Subscription.stripe_subscription_id == stripe_sub_id))
            sub = result.scalars().first()
            if sub:
                sub.status = "past_due"
                await db.commit()

    return {"received": True}