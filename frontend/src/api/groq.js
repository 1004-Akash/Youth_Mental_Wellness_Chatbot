/**
 * Frontend API client. Calls backend only. No API keys or AI logic here.
 * Uses process.env.VITE_API_URL (set in Vercel or .env).
 */

const getBaseUrl = () => {
  const url = import.meta.env?.VITE_API_URL || "";
  return url.replace(/\/$/, "");
};

export async function clearUserMemory() {
  const base = getBaseUrl();
  if (!base) return;
  try {
    await fetch(`${base}/clear-memory`, { method: "POST" });
  } catch (_) {
    // ignore
  }
}

export async function getGroqReply(messages, language = "en", memoryReset = false) {
  const base = getBaseUrl();
  if (!base) {
    return "Backend URL not set. Add VITE_API_URL (e.g. your Render backend URL).";
  }
  try {
    const res = await fetch(`${base}/ai`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        messages: messages.map((m) => ({ role: m.role, content: m.content || "" })),
        language,
        memory_reset: memoryReset,
      }),
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || res.statusText);
    }
    const data = await res.json();
    return data.content || "Sorry, I couldn't generate a response.";
  } catch (err) {
    return "Sorry, I'm having trouble connecting to the AI service right now.";
  }
}
