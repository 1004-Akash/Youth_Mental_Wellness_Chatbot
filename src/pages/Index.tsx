import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import Dashboard from "@/components/Dashboard";
import ChatInterface from "@/components/ChatInterface";
import MoodTracker from "@/components/MoodTracker";
import Settings from "@/components/Settings";
import PeerSupport from "@/components/PeerSupport";
import { clearUserMemory } from "@/api/groq";

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

const Index = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [chatHistory, setChatHistory] = useState<Message[]>([{
    id: "1",
    content: "Hello! I'm Innervoice, your mental wellness companion. I'm here to listen and support you. How are you feeling today?",
    isBot: true,
    timestamp: new Date()
  }]);
  const [moodEntries, setMoodEntries] = useState<MoodEntry[]>([]);

  const handleStartChat = () => {
    setActiveTab("chat");
  };

  const handleTrackMood = () => {
    setActiveTab("mood-tracker");
  };

  const handleRefreshChat = async () => {
    // First, clear the Groq API's memory
    clearUserMemory();
    
    // Send reset messages
    const welcomeMessage = {
      id: Date.now().toString(),
      content: "Hello! I'm Innervoice, your mental wellness companion. I'm here to listen and support you. How are you feeling today?",
      isBot: true,
      timestamp: new Date()
    };

    // Reset to just the welcome message
    setChatHistory([welcomeMessage]);
  };

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <Dashboard onStartChat={handleStartChat} onTrackMood={handleTrackMood} moodEntries={moodEntries} />;
      case "chat":
        return <ChatInterface messages={chatHistory} onHistoryUpdate={setChatHistory} moodEntries={moodEntries} setMoodEntries={setMoodEntries} />;
      case "mood-tracker":
        return <MoodTracker moodEntries={moodEntries} />;
      case "settings":
        return <Settings />;
      case "peer-support":
        return <PeerSupport />;
      default:
        return <Dashboard onStartChat={handleStartChat} onTrackMood={handleTrackMood} moodEntries={moodEntries} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        onRefreshChat={handleRefreshChat}
      />
      <main className="flex-1 overflow-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default Index;
