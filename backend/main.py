import os
from dotenv import load_dotenv
load_dotenv()

from contextlib import asynccontextmanager

import requests
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import List

from pydantic import BaseModel

# In-memory store for conversation context (per backend instance)
user_memory = {}

def build_memory_context():
    if not user_memory:
        return "None yet."
    return "\n".join(f"- {k}: {v}" for k, v in user_memory.items())

def get_system_prompt():
    return f"""
You are a compassionate, culturally sensitive AI mental wellness companion for Indian youth.
You are safe, supportive, and non-judgmental.

Known context about the user:
{build_memory_context()}

Your job is to:
- Respond kindly and empathy.
- Identify and remember key facts such as identity, academic achievements, goals, struggles.
- Reuse those facts in follow-up questions.
- Clear memory if the user says "forget" or "clear memory".
- NEVER encourage self-harm or suicide. Suggest professional help or trusted adults.

If the user expresses distress, show care and direct them to a helpline (e.g. iCall: +91 9152987821).
Respond like a supportive friend. Use emojis sparingly. Use Hinglish if the user does.
Keep responses short, warm, and personalized.
"""

def update_user_memory(messages):
    global user_memory
    user_msgs = [m for m in messages if m.get("role") == "user"]
    if not user_msgs:
        return
    last_msg = (user_msgs[-1].get("content") or "").lower()
    if "forget" in last_msg or "clear memory" in last_msg:
        user_memory = {}
        return
    if "i am" in last_msg or "i'm" in last_msg:
        import re
        m = re.search(r"i\s*(?:am|'m|'m)\s+([a-zA-Z\s]{1,50})", last_msg)
        if m:
            user_memory["Identity"] = m.group(1).strip()
    if "scored" in last_msg or "got" in last_msg:
        import re
        m = re.search(r"scored\s+(\d+%?)", last_msg) or re.search(r"got\s+(\d+%?)", last_msg)
        if m:
            user_memory["Academic Score"] = m.group(1)
    if "want to be" in last_msg or "want to become" in last_msg:
        import re
        m = re.search(r"i\s+want\s+to\s+be(?:come)?\s+a\s+([a-z\s]+)", last_msg)
        if m:
            user_memory["Goal"] = m.group(1).strip()
    if "feel like a" in last_msg:
        import re
        m = re.search(r"i\s+feel\s+like\s+a\s+([a-z\s]+)", last_msg)
        if m:
            user_memory["Struggle"] = m.group(1).strip()

@asynccontextmanager
async def lifespan(app):
    yield
    # optional cleanup

app = FastAPI(title="InnerVoice AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AIMessage(BaseModel):
    role: str
    content: str

class AIRequest(BaseModel):
    messages: List[AIMessage]
    language: str = "en"
    memory_reset: bool = False

class AIResponse(BaseModel):
    content: str

def clear_memory():
    global user_memory
    user_memory = {}

@app.get("/")
def root():
    """If someone opens the backend URL in a browser, point them to the frontend."""
    from fastapi.responses import HTMLResponse
    return HTMLResponse(
        "<!DOCTYPE html><html><head><meta charset='utf-8'><title>InnerVoice API</title></head><body>"
        "<h1>InnerVoice API</h1><p>Backend is running. Use the app at <a href='http://localhost:8080'>http://localhost:8080</a>.</p>"
        "<p><a href='/docs'>API docs</a></p></body></html>"
    )

@app.post("/ai", response_model=AIResponse)
def post_ai(req: AIRequest):
    api_key = os.environ.get("API_KEY")
    if not api_key:
        return AIResponse(content="Server error: API_KEY not configured.")
    groq_url = "https://api.groq.com/openai/v1/chat/completions"
    if req.memory_reset:
        clear_memory()

    messages_raw = [m.model_dump() for m in req.messages]
    if not req.memory_reset:
        update_user_memory(messages_raw)

    system_prompt = get_system_prompt()
    if req.language != "en":
        lang_map = {"hi": "Hindi", "ta": "Tamil", "bn": "Bengali", "mr": "Marathi"}
        lang_name = lang_map.get(req.language, "the selected language")
        system_prompt += f"\n\nIMPORTANT: Reply in {lang_name} unless the user switches back to English."

    payload = {
        "model": "llama3-8b-8192",
        "messages": [
            {"role": "system", "content": system_prompt},
            *[m for m in messages_raw if (m.get("content") or "").strip()],
        ],
        "temperature": 0.7,
    }

    try:
        r = requests.post(
            groq_url,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            json=payload,
            timeout=60,
        )
        r.raise_for_status()
        data = r.json()
        content = (data.get("choices") or [{}])[0].get("message", {}).get("content")
        return AIResponse(content=content or "Sorry, I couldn't generate a response.")
    except Exception as e:
        return AIResponse(content=f"Sorry, I'm having trouble connecting to the AI service. ({e})")

@app.post("/clear-memory")
def post_clear_memory():
    clear_memory()
    return {"ok": True}

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)
