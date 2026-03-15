// In-memory store for conversation context (demo)
let userMemory = {};

export function clearUserMemory() {
  for (const key in userMemory) {
    if (Object.prototype.hasOwnProperty.call(userMemory, key)) {
      delete userMemory[key];
    }
  }
}

function buildMemoryContext() {
  if (Object.keys(userMemory).length === 0) return "None yet.";
  return Object.entries(userMemory)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
}

function getSystemPrompt() {
  return `
You are a compassionate, culturally sensitive AI mental wellness companion for Indian youth.
You are safe, supportive, and non-judgmental.

Known context about the user:
${buildMemoryContext()}

Your job is to:
- Respond kindly and with empathy.
- Identify and remember key facts such as identity, academic achievements, goals, struggles.
- Reuse those facts in follow-up questions.
- Clear memory if the user says "forget" or "clear memory".
- NEVER encourage self-harm or suicide. Suggest professional help or trusted adults.

If the user expresses distress, show care and direct them to a helpline (e.g. iCall: +91 9152987821).
Respond like a supportive friend. Use emojis sparingly. Use Hinglish if the user does.
Keep responses short, warm, and personalized.
`;
}

function updateUserMemory(messages) {
  const lastMsg = messages.filter((m) => m.role === "user").pop()?.content?.toLowerCase();
  if (!lastMsg) return;

  if (lastMsg.includes("forget") || lastMsg.includes("clear memory")) {
    userMemory = {};
    return;
  }

  const identityMatch = lastMsg.match(/i\s*(am|'m|'m)\s+([a-zA-Z\s]+)/);
  if (identityMatch && identityMatch[2].length < 50) {
    userMemory["Identity"] = identityMatch[2].trim();
  }

  const scoreMatch = lastMsg.match(/scored\s+(\d+%?)/) || lastMsg.match(/got\s+(\d+%?)/);
  if (scoreMatch) userMemory["Academic Score"] = scoreMatch[1];

  const goalMatch = lastMsg.match(/i\s+want\s+to\s+be(?:come)?\s+a\s+([a-z\s]+)/);
  if (goalMatch) userMemory["Goal"] = goalMatch[1].trim();

  const struggleMatch = lastMsg.match(/i\s+feel\s+like\s+a\s+([a-z\s]+)/);
  if (struggleMatch) userMemory["Struggle"] = struggleMatch[1].trim();
}

const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = import.meta.env.VITE_GROQ_API_URL;

export async function getGroqReply(messages, language = "en", memoryReset = false) {
  if (!memoryReset) updateUserMemory(messages);

  let systemPrompt = getSystemPrompt();
  if (language !== "en") {
    const langMap = { hi: "Hindi", ta: "Tamil", bn: "Bengali", mr: "Marathi" };
    systemPrompt += `\n\nIMPORTANT: Reply in ${langMap[language] || "the selected language"} unless the user switches back to English.`;
  }

  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.filter((m) => m.content && m.content.trim()),
    ],
    temperature: 0.7,
  };

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error("Groq API error: " + response.statusText + "\n" + errorText);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
}
