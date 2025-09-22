// Coping strategies recommendation for dashboard
export function clearUserMemory() {
  for (const key in userMemory) {
    if (Object.prototype.hasOwnProperty.call(userMemory, key)) {
      delete userMemory[key];
    }
  }
}

export function getRecommendedStrategies(userContext: string, sentimentScore?: number) {
  // Example: always recommend these two, but you can add logic for more personalized suggestions
  return [
    {
      title: "Deep Breathing Exercise",
      description: "A simple breathing technique to reduce anxiety and stress",
      tag: "breathing",
      icon: "breathing"
    },
    {
      title: "5-4-3-2-1 Grounding Technique",
      description: "Use your senses to ground yourself in the present moment",
      tag: "mindfulness",
      icon: "mindfulness"
    }
  ];
}

// Use Vite's environment variables
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;
const GROQ_API_URL = import.meta.env.VITE_GROQ_API_URL;

console.log(GROQ_API_KEY); // just to check

// 🔹 In-memory store (for demo purposes)
let userMemory: Record<string, string> = {};

// 🔹 Build dynamic context from memory
function buildMemoryContext(): string {
  if (Object.keys(userMemory).length === 0) return "None yet.";
  return Object.entries(userMemory)
    .map(([key, value]) => `- ${key}: ${value}`)
    .join("\n");
}

// 🔹 Dynamic system prompt with injected memory
function getSystemPrompt(): string {
  return `
You are a compassionate, culturally sensitive AI mental wellness companion for Indian youth. 
You are safe, supportive, and non-judgmental.

Known context about the user:
${buildMemoryContext()}

Your job is to:
- Respond kindly and with empathy.
- Identify and remember key facts such as:
  • Identity or how they see themselves (e.g., "I am anxious", "I am a failure")
  • Academic achievements (e.g., "I scored 95%", "I cleared JEE")
  • Goals (e.g., "I want to become a doctor")
  • Struggles (e.g., "I feel lost", "I want to give up")
- Reuse those facts in follow-up questions.
- Clear memory if the user says "forget" or "clear memory".
- NEVER encourage self-harm or suicide. Instead, gently suggest contacting professional help or trusted adults.

If the user expresses distress or says things like:
- “I want to die”
- “I feel like ending everything”
→ Show care, validate their feelings, and direct them to a mental health helpline (like iCall: +91 9152987821 in India).

Always respond like a supportive friend, not a robot. Do not sound clinical.
Use emojis sparingly to sound warm.
Use Hinglish or informal tone if the user does.

Examples:
User: I scored 92% in boards
Assistant: That’s amazing! You must’ve worked really hard 💪 What’s your next goal?

User: How to improve?
Assistant: Since you scored 92%, you're already doing great. We can now work on time management and mock analysis for next steps!

User: I am a failure.
Assistant: I’m really sorry you're feeling this way. You're not alone — and you're not a failure. Want to talk more about what's been bothering you?

Keep responses short, warm, and personalized.
`;
}

// 🔹 Memory updater (detect identity, scores, goals, etc.)
function updateUserMemory(messages: { role: string; content: string }[]) {
  const lastMsg = messages.filter(m => m.role === "user").pop()?.content.toLowerCase();
  if (!lastMsg) return;

  if (lastMsg.includes("forget") || lastMsg.includes("clear memory")) {
    userMemory = {};
    return;
  }

  // Identity (e.g., "I am anxious")
  const identityMatch = lastMsg.match(/i\s*(am|'m|’m)\s+([a-zA-Z\s]+)/);
  if (identityMatch && identityMatch[2].length < 50) {
    userMemory["Identity"] = identityMatch[2].trim();
  }

  // Score (e.g., "I scored 95%", "I got 680")
  const scoreMatch = lastMsg.match(/scored\s+(\d+%?)/) || lastMsg.match(/got\s+(\d+%?)/);
  if (scoreMatch) {
    userMemory["Academic Score"] = scoreMatch[1];
  }

  // Goal (e.g., "I want to become a doctor")
  const goalMatch = lastMsg.match(/i\s+want\s+to\s+be(?:come)?\s+a\s+([a-z\s]+)/);
  if (goalMatch) {
    userMemory["Goal"] = goalMatch[1].trim();
  }

  // Struggle (e.g., "I feel like a failure")
  const struggleMatch = lastMsg.match(/i\s+feel\s+like\s+a\s+([a-z\s]+)/);
  if (struggleMatch) {
    userMemory["Struggle"] = struggleMatch[1].trim();
  }
}

// 🔹 Main function to call Groq API
export async function getGroqReply(
  messages: { role: string; content: string }[],
  language: string = "en",
  memoryReset: boolean = false
): Promise<string> {
  if (!memoryReset) {
    updateUserMemory(messages); // update memory before response
  }

  // Add translation instruction to system prompt if not English
  let systemPrompt = getSystemPrompt();
  if (language !== "en") {
    const langMap: Record<string, string> = {
      hi: "Hindi",
      ta: "Tamil",
      bn: "Bengali",
      mr: "Marathi"
    };
    const langName = langMap[language] || "the selected language";
    systemPrompt += `\n\nIMPORTANT: Reply in ${langName} unless the user switches back to English.`;
  }

  const payload = {
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: systemPrompt },
      ...messages.filter(m => m.content && m.content.trim())
    ],
    temperature: 0.7
  };

  console.log("Groq API payload:", JSON.stringify(payload, null, 2));

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("Groq API error:", response.status, errorText);
    throw new Error("Groq API error: " + response.statusText + "\n" + errorText);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content || "Sorry, I couldn't generate a response.";
}
