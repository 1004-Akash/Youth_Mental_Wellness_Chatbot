import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import BreathingExercise from "./BreathingExercise";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageCircle, 
  TrendingUp, 
  Heart,
  Wind,
  MapPin,
  ArrowRight
} from "lucide-react";

interface MoodEntry {
  score: number;
  message: string;
  timestamp: Date;
}

interface DashboardProps {
  onStartChat: () => void;
  onTrackMood: () => void;
  moodEntries: MoodEntry[];
}

const Dashboard = ({ onStartChat, onTrackMood, moodEntries }: DashboardProps) => {

  // Calculate mood stats from moodEntries
  const last7 = moodEntries.slice(0, 7);
  const avgMood = last7.length > 0 ? (last7.reduce((sum, e) => sum + e.score, 0) / last7.length) : 0;
  const avgMoodDisplay = avgMood > 2 ? "😁" : avgMood > 0 ? "😊" : avgMood === 0 ? "😐" : avgMood > -3 ? "😞" : "😢";
  const avgMoodLabel = avgMood > 2 ? "Very Happy" : avgMood > 0 ? "Happy" : avgMood === 0 ? "Neutral" : avgMood > -3 ? "Sad" : "Very Sad";
  const moodCount = moodEntries.length;
  const recentEntry = moodEntries[0];

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Welcome back to InnerVoice
          </h1>
          <p className="text-muted-foreground">Here's how you've been doing lately</p>
        </div>
        <Button onClick={onStartChat} className="bg-primary hover:bg-primary/90">
          <MessageCircle className="w-4 h-4 mr-2" />
          Chat with InnerVoice
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">7-Day Mood Average</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <span className="text-2xl">{avgMoodDisplay}</span>
              <div>
                <div className="text-2xl font-semibold">{avgMood.toFixed(1)}/10</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {avgMoodLabel}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Mood Entries</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{moodCount}</div>
            <div className="text-sm text-muted-foreground">This week</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">Recent Mood</CardTitle>
          </CardHeader>
          <CardContent>
            {recentEntry ? (
              <div className="flex items-center gap-2">
                <span className="text-2xl">{recentEntry.score > 2 ? "😁" : recentEntry.score > 0 ? "😊" : recentEntry.score === 0 ? "😐" : recentEntry.score > -3 ? "😞" : "😢"}</span>
                <div>
                  <div className="text-sm font-medium">
                    {recentEntry.score > 2 ? "Very Happy" : recentEntry.score > 0 ? "Happy" : recentEntry.score === 0 ? "Neutral" : recentEntry.score > -3 ? "Sad" : "Very Sad"}
                  </div>
                  <div className="text-xs text-muted-foreground">{recentEntry.message}</div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">No recent mood entry.</div>
            )}
          </CardContent>
        </Card>
      </div>

      

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Wind className="w-4 h-4" />
            Deep Breathing Exercise
          </CardTitle>
          <p className="text-sm text-muted-foreground">A simple breathing technique to reduce anxiety and stress</p>
        </CardHeader>
        <CardContent>
          <BreathingExercise />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-gradient-to-br from-mental-calm-light to-background border-mental-calm/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Continue Your Journey</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Chat with InnerVoice about how you're feeling today
            </p>
            <Button onClick={onStartChat} className="w-full bg-primary hover:bg-primary/90">
              Start Conversation
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-mental-warm to-background border-mental-warning/20">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-2">Self-Care Check</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Take a moment to reflect on your current mood
            </p>
            <Button 
              variant="outline" 
              onClick={onTrackMood}
              className="w-full"
            >
              Track Mood
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;