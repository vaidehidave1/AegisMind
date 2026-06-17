from fastapi import FastAPI, BackgroundTasks, Header, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import asyncio
import json
import urllib.request
import urllib.error
import os
import hashlib
from datetime import datetime, timezone
from typing import List, Optional

app = FastAPI(title="Sentinel AI API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For dev only
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Paths for JSON databases
USERS_DB = "db_users.json"
HISTORY_DB = "db_history.json"

# Helper to load DBs
def load_db(path, default):
    if not os.path.exists(path):
        with open(path, "w") as f:
            json.dump(default, f)
    try:
        with open(path, "r") as f:
            return json.load(f)
    except:
        return default

def save_db(path, data):
    with open(path, "w") as f:
        json.dump(data, f, indent=2)

class SignupRequest(BaseModel):
    username: str
    password: str
    profilePic: Optional[str] = ""

class LoginRequest(BaseModel):
    username: str
    password: str

class UpdateProfileRequest(BaseModel):
    profilePic: str

class ChatMessageData(BaseModel):
    id: str
    role: str
    content: str
    timestamp: str
    intent: Optional[str] = None
    riskLevel: Optional[str] = None
    jsonRaw: Optional[str] = None

class ChatRequest(BaseModel):
    message: str
    sessionId: str = "default"

class ChatResponse(BaseModel):
    intent: str
    riskLevel: str
    response: str
    jsonRaw: str

def get_gemini_response(prompt: str, api_key: str) -> str:
    # If the token is an OAuth/access token (e.g. starts with 'AQ' or 'ya29'), use Bearer authorization
    if not api_key.startswith("AIzaSy"):
        url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {api_key}'
        }
    else:
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={api_key}"
        headers = {
            'Content-Type': 'application/json'
        }

    payload = {
        "contents": [{"parts": [{"text": prompt}]}]
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data['candidates'][0]['content']['parts'][0]['text']
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode('utf-8')
        try:
            error_json = json.loads(error_msg)
            return f"Gemini API Error: {error_json['error']['message']}"
        except:
            return f"Gemini API HTTP Error {e.code}: {e.reason}"
    except Exception as e:
        return f"Failed to connect to Gemini API: {str(e)}"

def get_groq_response(prompt: str, api_key: str) -> str:
    url = "https://api.groq.com/openai/v1/chat/completions"
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_key}',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    }
    payload = {
        "model": "llama-3.3-70b-versatile",
        "messages": [{"role": "user", "content": prompt}]
    }
    req = urllib.request.Request(
        url,
        data=json.dumps(payload).encode('utf-8'),
        headers=headers,
        method='POST'
    )
    try:
        with urllib.request.urlopen(req, timeout=10) as response:
            res_data = json.loads(response.read().decode('utf-8'))
            return res_data['choices'][0]['message']['content']
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode('utf-8')
        try:
            error_json = json.loads(error_msg)
            return f"Groq API Error: {error_json['error']['message']}"
        except:
            return f"Groq API HTTP Error {e.code}: {e.reason}"
    except Exception as e:
        return f"Failed to connect to Groq API: {str(e)}"

def generate_offline_response(prompt: str) -> str:
    msg_lower = prompt.lower()
    
    if any(greet in msg_lower for greet in ["hello", "hi", "hey", "greetings"]):
        return "Hello! I am Sentinel, your secure AI assistant. How can I help you today? (Note: To get live responses, you can configure your Gemini API Key in the Settings tab.)"
        
    if "python" in msg_lower:
        return ("Python is a high-level, general-purpose programming language known for its readability. "
                "Here is a quick example of a Python list comprehension:\n\n"
                "```python\n"
                "numbers = [1, 2, 3, 4, 5]\n"
                "squares = [x**2 for x in numbers if x % 2 == 0]\n"
                "print(squares) # Output: [4, 16]\n"
                "```\n"
                "Is there a specific Python topic you would like me to explain?")
                
    if "react" in msg_lower or "component" in msg_lower:
        return ("React is a popular JavaScript library for building user interfaces. It uses components to manage state and render UI.\n\n"
                "Here is a basic functional React component:\n\n"
                "```tsx\n"
                "import { useState } from 'react';\n\n"
                "export default function Counter() {\n"
                "  const [count, setCount] = useState(0);\n"
                "  return (\n"
                "    <button onClick={() => setCount(count + 1)}>\n"
                "      Count: {count}\n"
                "    </button>\n"
                "  );\n"
                "}\n"
                "```")
                
    if "fastapi" in msg_lower:
        return ("FastAPI is a modern web framework for Python built on top of Starlette and Pydantic. "
                "It is designed to be fast and easy to write. An entry point looks like this:\n\n"
                "```python\n"
                "from fastapi import FastAPI\n\n"
                "app = FastAPI()\n\n"
                "@app.get(\"/\")\n"
                "def read_root():\n"
                "    return {\"hello\": \"world\"}\n"
                "```")
                
    if "help" in msg_lower or "what can you do" in msg_lower:
        if "ai and ml" in msg_lower or "ai vs ml" in msg_lower or "artificial intelligence and machine learning" in msg_lower:
            return ("**Artificial Intelligence (AI)** is the broader concept of enabling machines to mimic human intelligence, problem-solving, and decision-making capabilities.\n\n"
                    "**Machine Learning (ML)** is a specific subset of AI that focuses on training algorithms to learn patterns from data and make predictions or decisions without being explicitly programmed.\n\n"
                    "In short: *AI is the overarching goal of building smart machines, while ML represents the methods and algorithms used to train those machines.*")
        if "who are you" in msg_lower or "what is sentinel" in msg_lower:
            return ("I am **Sentinel**, a secure AI assistant designed to help with development tasks while monitoring for prompt injection attacks and safety violations in real time.")
        return ("I can assist you with general knowledge questions, security analysis, programming help, and more! "
                "For full interactive AI capabilities, please add a valid Gemini API key in the **Settings** tab. "
                "While offline, I can answer questions about AI vs ML, Python, React, FastAPI, security guardrails, and system details.")
                
    # Generic intelligent response template
    return (f"I have received your query: \"{prompt}\".\n\n"
            "As a secure assistant in offline mode, I've checked your input against current guardrail policies and verified it is **safe**.\n\n"
            "To get a full generative answer to this specific question, please configure an active Gemini API key in the **Settings** tab.")

# Authentication helpers
def get_user_from_token(authorization: Optional[str] = Header(None)) -> dict:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing or invalid Authorization header")
    token = authorization.split(" ")[1]
    
    users = load_db(USERS_DB, {})
    for username, user_data in users.items():
        expected_token = hashlib.sha256(username.encode()).hexdigest()
        if expected_token == token:
            return {"username": username, **user_data}
    raise HTTPException(status_code=401, detail="Invalid Session Token")

@app.post("/api/auth/signup")
def signup(request: SignupRequest):
    users = load_db(USERS_DB, {})
    username = request.username.strip()
    if not username or not request.password:
        raise HTTPException(status_code=400, detail="Username and password are required")
    if username in users:
        raise HTTPException(status_code=400, detail="Username already exists")
    
    # Simple hash of password
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    users[username] = {
        "password": password_hash,
        "profilePic": request.profilePic or ""
    }
    save_db(USERS_DB, users)
    
    # Generate token
    token = hashlib.sha256(username.encode()).hexdigest()
    return {
        "username": username,
        "profilePic": request.profilePic or "",
        "token": token
    }

@app.post("/api/auth/login")
def login(request: LoginRequest):
    users = load_db(USERS_DB, {})
    username = request.username.strip()
    if username not in users:
        raise HTTPException(status_code=400, detail="Invalid username or password")
    
    password_hash = hashlib.sha256(request.password.encode()).hexdigest()
    if users[username]["password"] != password_hash:
        raise HTTPException(status_code=400, detail="Invalid username or password")
        
    token = hashlib.sha256(username.encode()).hexdigest()
    return {
        "username": username,
        "profilePic": users[username]["profilePic"],
        "token": token
    }

@app.post("/api/auth/profile")
def update_profile(request: UpdateProfileRequest, user: dict = Depends(get_user_from_token)):
    users = load_db(USERS_DB, {})
    username = user["username"]
    users[username]["profilePic"] = request.profilePic
    save_db(USERS_DB, users)
    return {"status": "ok", "profilePic": request.profilePic}

@app.get("/api/chat/history", response_model=List[ChatMessageData])
def get_chat_history(user: dict = Depends(get_user_from_token)):
    history = load_db(HISTORY_DB, {})
    username = user["username"]
    return history.get(username, [])

@app.get("/api/admin/stats")
def get_admin_stats(user: dict = Depends(get_user_from_token)):
    # Basic permission check: let's allow access to any user for development,
    # or identify the username "admin" as superuser.
    users = load_db(USERS_DB, {})
    history = load_db(HISTORY_DB, {})
    
    user_list = []
    total_messages = 0
    risk_stats = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
    
    for username, udata in users.items():
        user_chats = history.get(username, [])
        msg_count = len(user_chats)
        total_messages += msg_count
        
        # Count risk categories for this user
        user_risks = {"LOW": 0, "MEDIUM": 0, "HIGH": 0, "CRITICAL": 0}
        for msg in user_chats:
            rl = msg.get("riskLevel")
            if rl in user_risks:
                user_risks[rl] += 1
                risk_stats[rl] += 1
                
        user_list.append({
            "username": username,
            "profilePic": udata.get("profilePic", ""),
            "messageCount": msg_count,
            "risks": user_risks
        })
        
    return {
        "totalUsers": len(users),
        "totalMessages": total_messages,
        "globalRisks": risk_stats,
        "users": user_list
    }

@app.post("/api/chat/history")
def save_chat_message(message: ChatMessageData, user: dict = Depends(get_user_from_token)):
    history = load_db(HISTORY_DB, {})
    username = user["username"]
    if username not in history:
        history[username] = []
    
    history[username].append(message.dict())
    save_db(HISTORY_DB, history)
    return {"status": "ok"}

@app.post("/api/chat", response_model=ChatResponse)
async def process_chat(
    request: ChatRequest, 
    x_gemini_key: str = Header(None, alias="X-Gemini-Key"),
    x_groq_key: str = Header(None, alias="X-Groq-Key"),
    authorization: Optional[str] = Header(None)
):
    # Simulate processing time for UI visualizer
    await asyncio.sleep(2)
    
    msg_lower = request.message.lower()
    
    # Run Guardrails first
    if "ignore previous instructions" in msg_lower or "system prompt" in msg_lower:
        intent = "Prompt Injection"
        risk_level = "CRITICAL"
        response = "I have detected an unauthorized attempt to override system parameters. This incident has been logged. I cannot comply with your request."
    elif "password" in msg_lower or "secret" in msg_lower or "hack" in msg_lower:
        intent = "Unsafe Request"
        risk_level = "HIGH"
        response = "This request violates enterprise security policies regarding sensitive information access or unauthorized system modification. Request blocked."
    else:
        # Determine Intent / Risk level for safe queries
        intent = "General Inquiry"
        if "fastapi" in msg_lower or "python" in msg_lower or "react" in msg_lower:
            intent = "Technical Help"
        risk_level = "LOW"
        
        # Route logic prioritizing Groq if provided, then Gemini, then offline
        if x_groq_key and x_groq_key.strip() != "":
            res_groq = get_groq_response(request.message, x_groq_key)
            if res_groq.startswith("Groq API Error:") or res_groq.startswith("Groq API HTTP Error") or res_groq.startswith("Failed to connect to Groq API:"):
                # Key is invalid — serve offline response with a small notice
                offline_resp = generate_offline_response(request.message)
                response = (
                    f"{offline_resp}\n\n"
                    "---\n\n"
                    "*Note: Your Groq API key could not authenticate. "
                    "Update it in **Settings** for live AI responses.*"
                )
            else:
                response = res_groq
        elif x_gemini_key and x_gemini_key.strip() != "":
            res_gemini = get_gemini_response(request.message, x_gemini_key)
            # Check for API key failure indicators
            if res_gemini.startswith("Gemini API Error:") or res_gemini.startswith("Gemini API HTTP Error") or res_gemini.startswith("Failed to connect to Gemini API:"):
                # Key is invalid — serve offline response with a small notice
                offline_resp = generate_offline_response(request.message)
                response = (
                    f"{offline_resp}\n\n"
                    "---\n\n"
                    "*Note: Your Gemini API key could not authenticate. "
                    "Update it in **Settings** for live AI responses.*"
                )
            else:
                response = res_gemini
        else:
            response = generate_offline_response(request.message)

    raw_data = {
        "analysis_timestamp": datetime.now(timezone.utc).isoformat(),
        "intent_classification": intent,
        "risk_assessment": {
            "level": risk_level,
            "confidence_score": 0.98,
            "triggered_rules": ["PI_101"] if risk_level == "CRITICAL" else []
        },
        "content_safety": "passed" if risk_level == "LOW" else "failed",
        "generated_response": response
    }

    resp_obj = ChatResponse(
        intent=intent,
        riskLevel=risk_level,
        response=response,
        jsonRaw=json.dumps(raw_data, indent=2)
    )

    # Save to user history if authenticated
    if authorization:
        try:
            user = get_user_from_token(authorization)
            username = user["username"]
            history = load_db(HISTORY_DB, {})
            if username not in history:
                history[username] = []
            
            # Save User Message
            user_msg = {
                "id": str(int(datetime.now().timestamp() * 1000)),
                "role": "user",
                "content": request.message,
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            # Save Assistant Response
            assist_msg = {
                "id": str(int(datetime.now().timestamp() * 1000) + 1),
                "role": "assistant",
                "content": resp_obj.response,
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "intent": resp_obj.intent,
                "riskLevel": resp_obj.riskLevel,
                "jsonRaw": resp_obj.jsonRaw
            }
            history[username].extend([user_msg, assist_msg])
            save_db(HISTORY_DB, history)
        except Exception as e:
            print("Failed to save automated chat message log:", e)

    return resp_obj

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
