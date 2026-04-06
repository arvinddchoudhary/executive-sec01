from apscheduler.schedulers.asyncio import AsyncIOScheduler
from models.database import AsyncSessionLocal
from agents.email_agent import run_email_agent
import asyncio
import logging
from sqlalchemy import select
from models.orm_models import User

logger = logging.getLogger(__name__)
scheduler = AsyncIOScheduler()

async def poll_and_process():
    logger.info("Auto-polling Gmail for all active users...")
    try:
        async with AsyncSessionLocal() as db:
            result = await db.execute(
                select(User).where(
                    User.gmail_refresh_token != None,
                    User.onboarding_complete == True
                )
            )
            users = result.scalars().all()

            if not users:
                logger.info("No users with connected Gmail.")
                return

            from services.gmail_oauth_service import fetch_user_emails_oauth

            for user in users:
                logger.info(f"Polling for: {user.email}")
                try:
                    emails = await asyncio.to_thread(
                        fetch_user_emails_oauth,
                        user.email,
                        user.gmail_access_token,
                        user.gmail_refresh_token,
                        user.gmail_token_expiry,
                        5
                    )
                    
                    if not emails:
                        logger.info(f"No new emails for {user.email}")
                        continue

                    for e in emails:
                        try:
                            result_msg = await run_email_agent(
                                sender=e["sender"],
                                subject=e["subject"],
                                body=e["body"],
                                db=db,
                                user_id=user.id,
                                attachments=e.get("attachments", [])
                            )
                            logger.info(f"{user.email} → {result_msg}")
                            await asyncio.sleep(1.5)
                        except Exception as ex:
                            logger.error(f"Error processing email for {user.email}: {ex}")

                except Exception as ex:
                    logger.error(f"Failed polling for {user.email}: {ex}")

    except Exception as ex:
        logger.error(f"Global polling error: {ex}")

def start_scheduler():
    scheduler.add_job(
        poll_and_process,
        "interval",
        seconds=60,
        id="gmail_poller",
        replace_existing=True,
        max_instances=1
    )
    scheduler.start()
    logger.info("Multi-user auto-poller started — every 60 seconds.")

def stop_scheduler():
    scheduler.shutdown()