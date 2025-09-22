import { useState, useEffect } from 'react';

const BreathingExercise = () => {
  const [phase, setPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (!isActive) return;

    const breathingCycle = async () => {
      // Inhale for 4 seconds
      setPhase('inhale');
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Hold for 4 seconds
      setPhase('hold');
      await new Promise(resolve => setTimeout(resolve, 4000));
      
      // Exhale for 4 seconds
      setPhase('exhale');
      await new Promise(resolve => setTimeout(resolve, 4000));
    };

    const interval = setInterval(breathingCycle, 12000);
    breathingCycle();

    return () => clearInterval(interval);
  }, [isActive]);

  const getInstructions = () => {
    switch (phase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      default:
        return 'Click to start';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 space-y-8">
      <button
        onClick={() => setIsActive(!isActive)}
        className="px-6 py-2.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 font-medium"
      >
        {isActive ? 'Stop' : 'Start'} Breathing Exercise
      </button>
      
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* Background fill circle */}
        <div
          className={`absolute inset-0 rounded-full transition-all duration-[4000ms] bg-primary/20
            ${phase === 'inhale' ? 'scale-150 bg-primary/40' : ''}
            ${phase === 'hold' ? 'scale-150 bg-primary/40' : ''}
            ${phase === 'exhale' ? 'scale-100 bg-primary/20' : ''}
            ${isActive ? 'opacity-100' : 'opacity-50'}
          `}
        />
        {/* Border circle */}
        <div
          className={`absolute inset-0 border-4 border-primary rounded-full transition-all duration-[4000ms]
            ${phase === 'inhale' ? 'scale-150' : ''}
            ${phase === 'hold' ? 'scale-150' : ''}
            ${phase === 'exhale' ? 'scale-100' : ''}
            ${isActive ? 'opacity-100' : 'opacity-50'}
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
};

export default BreathingExercise;