from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from models.database import get_db
from models.orm_models import Email, Attachment
from models.schemas import EmailIngest, EmailOut, AttachmentOut
from agents.email_agent import run_email_agent
from typing import List
import base64
import asyncio
from fastapi.responses import Response
from routes.auth import get_current_user

router = APIRouter()

@router.post("/ingest")
async def ingest_email(payload: EmailIngest, background_tasks: BackgroundTasks, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await run_email_agent(
        sender=payload.sender,
        subject=payload.subject,
        body=payload.body,
        db=db,
        user_id=current_user.id
    )
    return result

@router.get("/", response_model=List[EmailOut])
async def get_all_emails(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(
        select(Email)
        .where(Email.user_id == current_user.id)
        .order_by(Email.received_at.desc())
    )
    return result.scalars().all()

@router.post("/poll")
async def poll_gmail(db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    from services.subscription_service import require_active_subscription
    await require_active_subscription(current_user.id, db)

    results = []

    if current_user.gmail_refresh_token:
        from services.gmail_oauth_service import fetch_user_emails_oauth
        try:
            emails = await asyncio.to_thread(
                fetch_user_emails_oauth,
                current_user.email,
                current_user.gmail_access_token,
                current_user.gmail_refresh_token,
                current_user.gmail_token_expiry,
                5
            )
        except Exception as e:
            return {"error": f"Gmail OAuth fetch failed: {str(e)}", "fetched": 0}
    else:
        from services.email_service import fetch_unread_emails
        try:
            loop = asyncio.get_event_loop()
            emails = await asyncio.wait_for(
                loop.run_in_executor(None, fetch_unread_emails),
                timeout=20.0
            )
        except asyncio.TimeoutError:
            return {"error": "Gmail IMAP timed out", "fetched": 0}
        except Exception as e:
            return {"error": f"Gmail IMAP failed: {str(e)}", "fetched": 0}

    for e in emails:
        result = await run_email_agent(
            sender=e["sender"],
            subject=e["subject"],
            body=e["body"],
            db=db,
            user_id=current_user.id,
            attachments=e.get("attachments", [])
        )
        results.append(result)
        await asyncio.sleep(1.5)

    return {"fetched": len(emails), "results": results}

@router.get("/{email_id}/attachments", response_model=List[AttachmentOut])
async def get_attachments(email_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(
        select(Attachment)
        .join(Email, Attachment.email_id == Email.id)
        .where(Attachment.email_id == email_id, Email.user_id == current_user.id)
    )
    return result.scalars().all()

@router.get("/attachments/{attachment_id}/download")
async def download_attachment(attachment_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(select(Attachment).where(Attachment.id == attachment_id))
    att = result.scalars().first()
    if not att:
        raise HTTPException(status_code=404, detail="Attachment not found")
    file_bytes = base64.b64decode(att.file_data)
    return Response(
        content=file_bytes,
        media_type=att.content_type,
        headers={"Content-Disposition": f"attachment; filename={att.filename}"}
    )

@router.get("/{email_id}", response_model=EmailOut)
async def get_email(email_id: int, db: AsyncSession = Depends(get_db), current_user=Depends(get_current_user)):
    result = await db.execute(select(Email).where(Email.id == email_id, Email.user_id == current_user.id))
    email = result.scalars().first()
    if not email:
        raise HTTPException(status_code=404, detail="Email not found")
    return email