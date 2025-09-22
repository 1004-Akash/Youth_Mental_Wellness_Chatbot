import { useState, useRef } from "react";
// @ts-ignore
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Bot, User, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { getGroqReply, clearUserMemory } from "@/api/groq";
import Sentiment from 'sentiment';


interface Message {
  id: string;
  content: string;
  isBot: boolean;
  timestamp: Date;
}

interface MoodEntry {
  score: number;
  message: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  messages: Message[];
  onHistoryUpdate: (messages: Message[]) => void;
  moodEntries: MoodEntry[];
  setMoodEntries: React.Dispatch<React.SetStateAction<MoodEntry[]>>;
}

const ChatInterface = ({ messages, onHistoryUpdate, moodEntries, setMoodEntries }: ChatInterfaceProps) => {
  // Sentiment analysis for journaling
  const sentiment = new Sentiment();
  const [journalSentiment, setJournalSentiment] = useState<string | null>(null);
  const [memoryReset, setMemoryReset] = useState(false);
  
    // Info banner for ethical AI and support
    const InfoBanner = () => (
      <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded text-sm text-blue-900">
  <strong>Innervoice uses ethical AI:</strong> Your conversations are confidential, never shared, and analyzed only to support your well-being. If you need urgent help, please reach out to a trusted adult or helpline.
      </div>
    );
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([
  { role: "assistant", content: "Hello! I'm Innervoice, your mental wellness companion. I'm here to listen and support you. How are you feeling today?" }
  ]);
  const [language, setLanguage] = useState("en");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  // Voice input (SpeechRecognition)
  const startListening = () => {
    if (!SpeechRecognition) return alert("Speech recognition not supported in this browser.");
    const recognition = new SpeechRecognition();
    recognition.lang = language === "en" ? "en-US" : language;
    recognition.interimResults = false;
    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onerror = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInputValue(transcript);
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };
  // Text-to-speech (SpeechSynthesis)
  const speak = (text: string) => {
    if (!window.speechSynthesis) return;
    const utter = new window.SpeechSynthesisUtterance(text);
    utter.lang = language === "en" ? "en-US" : language;
    window.speechSynthesis.speak(utter);
  };

  // Groq API integration
  const fetchGroqResponse = async (userMessage: string) => {
    setIsTyping(true);
    try {
      // Add user message to messages immediately
      const updatedMessagesWithUser = [...messages, {
        id: Date.now().toString(),
        content: userMessage,
        isBot: false,
        timestamp: new Date(),
      }];
      onHistoryUpdate(updatedMessagesWithUser);


      // If memoryReset, only send the new user message (no previous chat history)
      let currentHistory;
      if (memoryReset) {
        currentHistory = [{ role: "user", content: userMessage }];
      } else {
        currentHistory = [...chatHistory, { role: "user", content: userMessage }];
      }

      // Pass memoryReset flag to Groq API
      const aiReply = await getGroqReply(currentHistory, language, memoryReset);

      // Add bot response to messages
      const finalMessages = [...updatedMessagesWithUser, {
        id: Date.now().toString(),
        content: aiReply,
        isBot: true,
        timestamp: new Date(),
      }];

      onHistoryUpdate(finalMessages);
      setChatHistory([...currentHistory, { role: "assistant", content: aiReply }]);
      speak(aiReply);
      if (memoryReset) setMemoryReset(false);
    } catch (err) {
      onHistoryUpdate([...messages, {
        id: Date.now().toString(),
        content: "Sorry, I'm having trouble connecting to the AI service right now.",
        isBot: true,
        timestamp: new Date(),
      }]);
    }
    setIsTyping(false);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    // Sentiment analysis for journaling
    const result = sentiment.analyze(inputValue);
    let feedback = "Neutral mood.";
    if (result.score > 2) feedback = "Positive mood detected! 😊";
    else if (result.score < -2) feedback = "You seem upset. If you want to talk, I'm here for you.";
    else if (result.score > 0) feedback = "Slightly positive mood.";
    else if (result.score < 0) feedback = "Slightly negative mood.";
    setJournalSentiment(feedback);

    // Add mood entry for this user message
    setMoodEntries(prev => [
      {
        score: result.score,
        message: inputValue,
        timestamp: new Date(),
      },
      ...prev
    ]);

    const currentInput = inputValue;
    setInputValue(""); // Clear input immediately for better UX

    // Send message and get response
    await fetchGroqResponse(currentInput);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleDeleteChat = async () => {
    if (window.confirm("Are you sure you want to delete this conversation? This cannot be undone.")) {
      clearUserMemory();
      setMemoryReset(true);
      onHistoryUpdate([{
        id: Date.now().toString(),
        content: "Hello! I'm Innervoice, your mental wellness companion. I'm here to listen and support you. How are you feeling today?",
        isBot: true,
        timestamp: new Date()
      }]);
    }
  };

  return (
      <div className="p-6 h-full flex flex-col">
        <div className="mb-4 flex justify-between items-center">
          <div className="flex gap-2 items-center">
            <label htmlFor="language" className="text-sm font-medium">Language:</label>
            <select id="language" value={language} onChange={e => setLanguage(e.target.value)} className="border rounded px-2 py-1">
              <option value="en">English</option>
              <option value="hi">हिन्दी</option>
              <option value="ta">தமிழ்</option>
              <option value="bn">বাংলা</option>
              <option value="mr">मराठी</option>
            </select>
            <button type="button" onClick={isListening ? stopListening : startListening} className={`px-2 py-1 rounded ${isListening ? 'bg-red-200' : 'bg-blue-200'}`}>{isListening ? "Stop Voice" : "Voice Input"}</button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDeleteChat}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete Conversation
          </Button>
        </div>
        <InfoBanner />
        {journalSentiment && (
          <div className="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-900">
            <strong>Sentiment:</strong> {journalSentiment}
          </div>
        )}
        <Card className="flex-1 flex flex-col">
        <CardHeader className="border-b border-border">
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" />
            InnerVoice
            <span className="text-sm font-normal text-muted-foreground ml-2">
              Welcome to Youth Mental Wellness Chatbot
            </span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-1 flex flex-col p-0">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.isBot ? "justify-start" : "justify-end"
                )}
              >
                {message.isBot && (
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                )}
                
                <div
                  className={cn(
                    "max-w-[80%] rounded-lg p-3 text-sm",
                    message.isBot
                      ? "bg-muted text-foreground"
                      : "bg-primary text-primary-foreground ml-auto"
                  )}
                >
                  {message.content}
                </div>
                
                {!message.isBot && (
                  <div className="w-8 h-8 bg-secondary rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-secondary-foreground" />
                  </div>
                )}
              </div>
            ))}
            
            {isTyping && (
              <div className="flex gap-3 justify-start">
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="bg-muted text-foreground rounded-lg p-3 text-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className="border-t border-border p-4">
            <div className="flex gap-2">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here..."
                className="flex-1"
              />
              <Button onClick={handleSendMessage} size="icon" disabled={!inputValue.trim()}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChatInterface;