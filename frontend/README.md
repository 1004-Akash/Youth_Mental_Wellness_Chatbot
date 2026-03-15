# InnerVoice Frontend

React + JavaScript (Vite). No API keys; all AI requests go to the backend via `fetch`.

## Setup

```bash
npm install
```

## Environment

Create `.env` (see `.env.example`):

- **VITE_API_URL** – Backend API base URL (e.g. `https://your-app.onrender.com` or `http://localhost:8000` for local backend).

No other env vars. Do not put API keys here.

## Run

```bash
npm run dev
```

## Build (e.g. for Vercel)

```bash
npm run build
```

Output is in `dist/`. Set `VITE_API_URL` in your Vercel project environment to your deployed backend URL.
