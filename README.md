# InnerVoice – Youth Mental Wellness

**Backend only** at `/backend` (FastAPI). A minimal **React Vite frontend** at `/frontend` with the 7 core components and shared CSS is included for local/dev use.

## Backend (`/backend`)

FastAPI app. Deploy to Render (or run locally).

- **POST /ai** – Chat with AI (body: `messages`, `language`, `memory_reset`). Uses `API_KEY` and optional `GROQ_API_URL` from env.
- **POST /clear-memory** – Clear in-memory user context.

```bash
cd backend
pip install -r requirements.txt
# Set API_KEY (and optionally GROQ_API_URL)
uvicorn main:app --host 0.0.0.0 --port 8000
```

Render: start command `uvicorn main:app --host 0.0.0.0 --port $PORT`, env vars `API_KEY`, `GROQ_API_URL` (optional).

## Frontend (`/frontend`) – optional

Minimal React + Vite app with these components and their CSS:

- **BreathingExercise.jsx**
- **ChatInterface.jsx**
- **Dashboard.jsx**
- **MoodTracker.jsx**
- **PeerSupport.jsx**
- **Settings.jsx**
- **Sidebar.jsx**

Shared UI: `card`, `button`, `input`, `label`, `switch`, `separator` (in `src/components/ui/`). Styles in `src/index.css`.

```bash
cd frontend
npm install
# Set VITE_API_URL to your backend URL (e.g. http://localhost:8000)
npm run dev
```

Build: `npm run build` (e.g. for static deploy). No API keys in frontend; it calls the backend via `VITE_API_URL`.
