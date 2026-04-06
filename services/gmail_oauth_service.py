from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request
from dotenv import load_dotenv
import os
import requests
from datetime import datetime, timedelta
from urllib.parse import urlencode

load_dotenv()

os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = '1'

CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")

SCOPES = " ".join([
    "https://www.googleapis.com/auth/gmail.readonly",
    "https://www.googleapis.com/auth/gmail.modify",
    "https://www.googleapis.com/auth/calendar",
    "openid",
    "email",
    "profile",
])

def get_auth_url(state: str = None):
    # Build auth URL manually — NO Flow object, NO PKCE
    params = {
        "client_id": CLIENT_ID,
        "redirect_uri": REDIRECT_URI,
        "response_type": "code",
        "scope": SCOPES,
        "access_type": "offline",
        "prompt": "consent",
        "include_granted_scopes": "true",
    }
    if state:
        params["state"] = state

    auth_url = "https://accounts.google.com/o/oauth2/v2/auth?" + urlencode(params)
    return auth_url, state

def exchange_code_for_tokens(code: str) -> dict:
    # Exchange code directly via HTTP POST — NO Flow object, NO PKCE verifier needed
    response = requests.post(
        "https://oauth2.googleapis.com/token",
        data={
            "code": code,
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "redirect_uri": REDIRECT_URI,
            "grant_type": "authorization_code",
        }
    )
    token_data = response.json()

    if "error" in token_data:
        raise Exception(f"Token exchange failed: {token_data['error']} - {token_data.get('error_description', '')}")

    expiry = datetime.utcnow() + timedelta(seconds=token_data.get("expires_in", 3600))

    return {
        "access_token": token_data["access_token"],
        "refresh_token": token_data.get("refresh_token"),
        "expiry": expiry,
    }

def get_credentials_for_user(access_token: str, refresh_token: str, expiry: datetime) -> Credentials:
    creds = Credentials(
        token=access_token,
        refresh_token=refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=CLIENT_ID,
        client_secret=CLIENT_SECRET,
    )
    if expiry:
        creds.expiry = expiry
    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
    return creds

# FIXED: Added user_email to signature
def fetch_user_emails_oauth(user_email: str, access_token: str, refresh_token: str, expiry: datetime, limit: int = 5) -> list:
    import imaplib
    import email as email_lib
    from email.header import decode_header
    from email.utils import parsedate_to_datetime
    import base64

    creds = get_credentials_for_user(access_token, refresh_token, expiry)

    try:
        mail = imaplib.IMAP4_SSL("imap.gmail.com", 993)
        
        # FIXED: Correctly formatted XOAUTH2 string requiring the user's email
        auth_string = f"user={user_email}\x01auth=Bearer {creds.token}\x01\x01"
        mail.authenticate("XOAUTH2", lambda x: auth_string.encode("utf-8"))
        
        mail.select("inbox")

        cutoff = datetime.now() - timedelta(hours=12)
        since_date = cutoff.strftime("%d-%b-%Y")
        _, message_numbers = mail.search(None, f'(UNSEEN SINCE {since_date})')

        nums = message_numbers[0].split()
        nums = nums[-limit:]

        skip_domains = [
            'noreply@', 'no-reply@', 'newsletter@', 'mailer.',
            'notifications@', 'digest@', 'donotreply@',
            'info@join.', 'alerts@', 'update@',
        ]

        email_list = []

        for num in nums:
            _, msg_data = mail.fetch(num, "(RFC822)")
            raw_email = msg_data[0][1]
            msg = email_lib.message_from_bytes(raw_email)

            subject_raw, encoding = decode_header(msg["Subject"])[0]
            subject = subject_raw.decode(encoding or "utf-8", errors="ignore") if isinstance(subject_raw, bytes) else subject_raw

            sender = msg.get("From", "")
            if any(d in sender.lower() for d in skip_domains):
                mail.store(num, "+FLAGS", "\\Seen")
                continue

            date_str = msg.get("Date", "")
            try:
                msg_date = parsedate_to_datetime(date_str).replace(tzinfo=None)
                if msg_date < cutoff:
                    mail.store(num, "+FLAGS", "\\Seen")
                    continue
            except Exception:
                pass

            body = ""
            attachments = []

            if msg.is_multipart():
                for part in msg.walk():
                    content_type = part.get_content_type()
                    disposition = str(part.get("Content-Disposition", ""))
                    if "attachment" in disposition:
                        filename = part.get_filename()
                        if filename:
                            file_data = base64.b64encode(part.get_payload(decode=True)).decode("utf-8")
                            attachments.append({"filename": filename, "content_type": content_type, "file_data": file_data})
                    elif content_type == "text/plain" and "attachment" not in disposition:
                        payload = part.get_payload(decode=True)
                        body = payload.decode("utf-8", errors="ignore") if payload else ""
                    elif content_type == "text/html" and not body:
                        payload = part.get_payload(decode=True)
                        body = payload.decode("utf-8", errors="ignore") if payload else ""
            else:
                payload = msg.get_payload(decode=True)
                body = payload.decode("utf-8", errors="ignore") if payload else ""

            email_list.append({"sender": sender, "subject": subject, "body": body, "attachments": attachments})
            mail.store(num, "+FLAGS", "\\Seen")

        mail.logout()
        return email_list

    except Exception as e:
        print(f"OAuth IMAP error for user {user_email}: {e}")
        return []