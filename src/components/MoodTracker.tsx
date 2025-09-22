import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, TrendingUp } from "lucide-react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface MoodEntry {
  score: number;
  message: string;
  timestamp: Date;
}

interface MoodTrackerProps {
  moodEntries: MoodEntry[];
}

const MoodTracker = ({ moodEntries }: MoodTrackerProps) => {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  // Remove local entries state, use moodEntries for chat-based data

  const moods = [
    { value: 1, emoji: "😢", label: "Very Sad" },
    { value: 2, emoji: "😞", label: "Sad" },
    { value: 3, emoji: "😐", label: "Neutral" },
    { value: 4, emoji: "😊", label: "Happy" },
    { value: 5, emoji: "😁", label: "Very Happy" },
  ];

  const moodTags = [
    "Work Stress", "Family", "Health", "Relationships", "School", "Social",
    "Exercise", "Sleep", "Weather", "Money", "Achievement", "Creativity",
  ];

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSaveMood = () => {
    if (!selectedMood) return;

    setIsSaving(true);

    setTimeout(() => {
      const newEntry = {
        mood: selectedMood,
        tags: selectedTags,
        timestamp: new Date(),
      };

      setEntries((prev) => [newEntry, ...prev]);
      setSelectedMood(null);
      setSelectedTags([]);
      setIsSaving(false);
      alert("Mood entry saved locally!");
    }, 800); // Simulate saving delay
  };

  const formatDate = (date: Date) =>
    date.toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getMoodEmoji = (value: number) =>
    moods.find((m) => m.value === value)?.emoji ?? "❓";

  const getMoodLabel = (value: number) =>
    moods.find((m) => m.value === value)?.label ?? "Unknown";

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-semibold">Mood Tracker</h1>
      </div>
      <p className="text-muted-foreground">Track your emotional wellbeing (locally only)</p>

    

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {moodEntries.length < 2 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Not enough data</p>
              </div>
            ) : (
              <div className="py-2">
                <Line
                  data={{
                    labels: moodEntries.slice().reverse().map((entry) =>
                      entry.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    ),
                    datasets: [
                      {
                        label: "Mood Score",
                        data: moodEntries.slice().reverse().map((entry) => entry.score),
                        borderColor: "#6366f1",
                        backgroundColor: "rgba(99,102,241,0.2)",
                        tension: 0.3,
                        fill: true,
                        pointRadius: 3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { display: false },
                      title: { display: false },
                    },
                    scales: {
                      y: {
                        min: -5,
                        max: 5,
                        title: { display: true, text: "Mood" },
                        ticks: {
                          stepSize: 1,
                          callback: function(value) {
                            if (value > 2) return "😁";
                            if (value > 0) return "😊";
                            if (value === 0) return "😐";
                            if (value > -3) return "😞";
                            return "😢";
                          }
                        }
                      }
                    }
                  }}
                  height={120}
                />
              </div>
            )}
          </CardContent>
        </Card>

        
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {moodEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No entries yet.</p>
            ) : (
              moodEntries.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <span className="text-2xl">{entry.score > 2 ? "😁" : entry.score > 0 ? "😊" : entry.score === 0 ? "😐" : entry.score > -3 ? "😞" : "😢"}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {entry.score > 2 ? "Very Happy" : entry.score > 0 ? "Happy" : entry.score === 0 ? "Neutral" : entry.score > -3 ? "Sad" : "Very Sad"}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(entry.timestamp)}
                    </div>
                    <div className="text-xs text-muted-foreground italic">
                      {entry.message}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MoodTracker;
