import { useState, useEffect } from "react";

const PHASES = { idle: "idle", inhale: "inhale", hold: "hold", exhale: "exhale" };

function BreathingExercise() {
  const [phase, setPhase] = useState(PHASES.idle);
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    function runCycle() {
      setPhase(PHASES.inhale);
      const t1 = setTimeout(() => {
        setPhase(PHASES.hold);
        const t2 = setTimeout(() => {
          setPhase(PHASES.exhale);
        }, 4000);
        return () => clearTimeout(t2);
      }, 4000);
      return () => clearTimeout(t1);
    }

    runCycle();
    const interval = setInterval(runCycle, 12000);
    return () => clearInterval(interval);
  }, [isActive]);

  function getInstructions() {
    if (phase === "inhale") return "Breathe In";
    if (phase === "hold") return "Hold";
    if (phase === "exhale") return "Breathe Out";
    return "Click to start";
  }

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8">
      <button
        type="button"
        onClick={() => setIsActive(!isActive)}
        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
      >
        {isActive ? "Stop" : "Start"} Breathing Exercise
      </button>

      <div className="relative w-48 h-48 flex items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full transition-all duration-[4000ms] bg-primary/20
            ${phase === "inhale" || phase === "hold" ? "scale-150 bg-primary/40" : ""}
            ${phase === "exhale" ? "scale-100 bg-primary/20" : ""}
            ${isActive ? "opacity-100" : "opacity-50"}
          `}
        />
        <div
          className={`absolute inset-0 border-4 border-primary rounded-full transition-all duration-[4000ms]
            ${phase === "inhale" || phase === "hold" ? "scale-150" : ""}
            ${phase === "exhale" ? "scale-100" : ""}
            ${isActive ? "opacity-100" : "opacity-50"}
          `}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="bg-background/90 px-6 py-3 rounded-full shadow-sm">
            <span className="text-lg font-medium text-primary tracking-wide">
              {getInstructions()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BreathingExercise;
