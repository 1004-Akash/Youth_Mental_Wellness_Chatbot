# InnerVoice – Youth Mental Wellness Chatbot

A React.js web app I built for youth mental wellness: an AI chat companion, mood tracking, breathing exercises, and an anonymous peer support section. It uses the Groq API for the chatbot and keeps the UI simple and accessible.

## What I built

- **Dashboard** – Overview with 7-day mood average, entry count, and quick actions to start a chat or log mood. I used React state to pass mood data between the chat and the dashboard.
- **Chat with InnerVoice** – Conversational UI with language selection (English, Hindi, Tamil, Bengali, Marathi), optional voice input (Web Speech API), and text-to-speech for replies. I integrated the Groq API with a custom system prompt and in-memory context so the bot can refer back to what the user shared.
- **Mood Tracker** – Combines mood from chat (sentiment from the `sentiment` library) with optional manual mood logs and tags. I used Chart.js (via react-chartjs-2) for a simple trend line.
- **Breathing Exercise** – A single-page breathing guide (inhale / hold / exhale) with a visual circle and timers, implemented with React state and `setTimeout`/`setInterval`.
- **Peer Support** – Anonymous posts stored in component state (no backend); I kept it minimal so it can be wired to an API later.
- **Settings** – Toggles for notifications and a “clear local data” option that uses `localStorage`/`sessionStorage` so users can reset their session.

## Tech stack I used

- **React** (no TypeScript in the app code – I wrote the main flow in plain JavaScript/JSX)
- **Vite** for build and dev server
- **React Router** for the single-page routes
- **TanStack Query** (React Query) for data fetching setup
- **Tailwind CSS** and **shadcn/ui** (Radix-based components) for the UI
- **Groq API** (Llama model) for the chatbot
- **Chart.js** for the mood trend chart
- **Sentiment** for basic sentiment scoring of chat messages

## How to run it

```bash
# Install dependencies
npm install

# Add your Groq API key and URL in .env (see .env.example if present)
# VITE_GROQ_API_KEY=your_key
# VITE_GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions

# Start the dev server
npm run dev
```

Then open the URL shown (e.g. http://localhost:8080).

## Project structure (how I organized it)

- `src/App.jsx` – Root layout, React Query and Router setup.
- `src/main.jsx` – Entry point; mounts the app into the DOM.
- `src/pages/` – `Index.jsx` (main screen with sidebar and content), `NotFound.jsx` (404).
- `src/components/` – Main feature components: `Dashboard.jsx`, `ChatInterface.jsx`, `MoodTracker.jsx`, `BreathingExercise.jsx`, `PeerSupport.jsx`, `Settings.jsx`, `Sidebar.jsx`. The `ui/` folder has the shared shadcn components.
- `src/api/groq.js` – Groq API client: system prompt, in-memory context, and `getGroqReply` / `clearUserMemory`.
- `src/lib/utils.js` – Small helpers (e.g. `cn` for class names).

I kept the app logic in React (hooks, state, and props) and used the existing UI library for consistency and faster development.
