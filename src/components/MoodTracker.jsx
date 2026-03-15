import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const moods = [
  { value: 1, emoji: "😢", label: "Very Sad" },
  { value: 2, emoji: "😞", label: "Sad" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "😊", label: "Happy" },
  { value: 5, emoji: "😁", label: "Very Happy" },
];

function getMoodEmoji(score) {
  if (score > 2) return "😁";
  if (score > 0) return "😊";
  if (score === 0) return "😐";
  if (score > -3) return "😞";
  return "😢";
}

function getMoodLabel(score) {
  if (score > 2) return "Very Happy";
  if (score > 0) return "Happy";
  if (score === 0) return "Neutral";
  if (score > -3) return "Sad";
  return "Very Sad";
}

function formatDate(date) {
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function MoodTracker({ moodEntries }) {
  const [localEntries, setLocalEntries] = useState([]);
  const [selectedMood, setSelectedMood] = useState(null);
  const [selectedTags, setSelectedTags] = useState([]);
  const [isSaving, setIsSaving] = useState(false);

  const moodTags = [
    "Work Stress",
    "Family",
    "Health",
    "Relationships",
    "School",
    "Social",
    "Exercise",
    "Sleep",
    "Weather",
    "Money",
    "Achievement",
    "Creativity",
  ];

  function toggleTag(tag) {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  }

  function handleSaveMood() {
    if (!selectedMood) return;
    setIsSaving(true);
    setTimeout(() => {
      setLocalEntries((prev) => [
        { mood: selectedMood, tags: [...selectedTags], timestamp: new Date() },
        ...prev,
      ]);
      setSelectedMood(null);
      setSelectedTags([]);
      setIsSaving(false);
      alert("Mood entry saved locally!");
    }, 800);
  }

  // Combined entries: chat-based mood first, then local manual entries
  const allEntries = [
    ...moodEntries.map((e) => ({
      score: e.score,
      message: e.message,
      timestamp: e.timestamp,
      source: "chat",
    })),
    ...localEntries.map((e) => ({
      score: e.mood <= 2 ? -e.mood : e.mood - 3,
      message: e.tags.join(", ") || "Manual entry",
      timestamp: e.timestamp,
      source: "manual",
    })),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-primary" />
        <h1 className="text-2xl font-semibold">Mood Tracker</h1>
      </div>
      <p className="text-muted-foreground">
        Track your emotional wellbeing. Entries from chat appear here; you can also log manually.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Trend</CardTitle>
          </CardHeader>
          <CardContent>
            {allEntries.length < 2 ? (
              <div className="text-center py-8 text-muted-foreground">
                <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Not enough data</p>
              </div>
            ) : (
              <div className="py-2">
                <Line
                  data={{
                    labels: allEntries
                      .slice()
                      .reverse()
                      .map((entry) =>
                        entry.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      ),
                    datasets: [
                      {
                        label: "Mood Score",
                        data: allEntries.slice().reverse().map((e) => e.score),
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
                    plugins: { legend: { display: false }, title: { display: false } },
                    scales: {
                      y: {
                        min: -5,
                        max: 5,
                        title: { display: true, text: "Mood" },
                        ticks: {
                          stepSize: 1,
                          callback(value) {
                            if (value > 2) return "😁";
                            if (value > 0) return "😊";
                            if (value === 0) return "😐";
                            if (value > -3) return "😞";
                            return "😢";
                          },
                        },
                      },
                    },
                  }}
                  height={120}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Log mood manually</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">How are you feeling?</p>
            <div className="flex flex-wrap gap-2">
              {moods.map((m) => (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setSelectedMood(m.value)}
                  className={`px-3 py-1.5 rounded border text-sm ${
                    selectedMood === m.value ? "bg-primary text-primary-foreground border-primary" : ""
                  }`}
                >
                  {m.emoji} {m.label}
                </button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">Tags (optional)</p>
            <div className="flex flex-wrap gap-1">
              {moodTags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`px-2 py-1 rounded text-xs border ${
                    selectedTags.includes(tag) ? "bg-muted" : ""
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={handleSaveMood}
              disabled={!selectedMood || isSaving}
              className="mt-2 px-4 py-2 rounded bg-primary text-primary-foreground text-sm disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save mood"}
            </button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {allEntries.length === 0 ? (
              <p className="text-sm text-muted-foreground">No entries yet. Chat or log a mood above.</p>
            ) : (
              allEntries.map((entry, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                >
                  <span className="text-2xl">{getMoodEmoji(entry.score)}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium">
                      {getMoodLabel(entry.score)}
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
}

export default MoodTracker;
