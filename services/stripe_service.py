import stripe
from dotenv import load_dotenv
import os

load_dotenv()

stripe.api_key = os.getenv("STRIPE_SECRET_KEY")

MONTHLY_PRICE_ID = os.getenv("STRIPE_MONTHLY_PRICE_ID")
YEARLY_PRICE_ID = os.getenv("STRIPE_YEARLY_PRICE_ID")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

def create_checkout_session(user_email: str, plan: str, stripe_customer_id: str = None) -> str:
    price_id = MONTHLY_PRICE_ID if plan == "monthly" else YEARLY_PRICE_ID

    params = {
        "payment_method_types": ["card"],
        "line_items": [{"price": price_id, "quantity": 1}],
        "mode": "subscription",
        "success_url": f"{FRONTEND_URL}/billing?success=true",
        "cancel_url": f"{FRONTEND_URL}/billing?cancelled=true",
        "customer_email": user_email if not stripe_customer_id else None,
        "customer": stripe_customer_id if stripe_customer_id else None,
        "subscription_data": {"trial_period_days": None},
    }

    session = stripe.checkout.Session.create(**params)
    return session.url

def create_customer_portal(stripe_customer_id: str) -> str:
    session = stripe.billing_portal.Session.create(
        customer=stripe_customer_id,
        return_url=f"{FRONTEND_URL}/billing",
    )
    return session.url

def get_subscription_status(stripe_subscription_id: str) -> str:
    try:
        sub = stripe.Subscription.retrieve(stripe_subscription_id)
        return sub.status
    except Exception:
        return "unknown"