import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Wind, Play, RotateCcw, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BreathingExerciseProps {
  onComplete: () => void;
  completed: boolean;
}

type Phase = "idle" | "inhale" | "hold" | "exhale" | "complete";

export const BreathingExercise = ({ onComplete, completed }: BreathingExerciseProps) => {
  const [phase, setPhase] = useState<Phase>("idle");
  const [count, setCount] = useState(0);
  const [round, setRound] = useState(0);
  const totalRounds = 3;

  const phaseDurations = {
    inhale: 4,
    hold: 4,
    exhale: 4,
  };

  const startExercise = useCallback(() => {
    setPhase("inhale");
    setCount(phaseDurations.inhale);
    setRound(1);
  }, []);

  const reset = () => {
    setPhase("idle");
    setCount(0);
    setRound(0);
  };

  useEffect(() => {
    if (phase === "idle" || phase === "complete") return;

    const timer = setInterval(() => {
      setCount((prev) => {
        if (prev > 1) return prev - 1;
        
        // Transition to next phase
        if (phase === "inhale") {
          setPhase("hold");
          return phaseDurations.hold;
        } else if (phase === "hold") {
          setPhase("exhale");
          return phaseDurations.exhale;
        } else if (phase === "exhale") {
          if (round < totalRounds) {
            setRound(r => r + 1);
            setPhase("inhale");
            return phaseDurations.inhale;
          } else {
            setPhase("complete");
            onComplete();
            return 0;
          }
        }
        return prev;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, round, onComplete]);

  const getPhaseInstruction = () => {
    switch (phase) {
      case "inhale": return "Breathe In";
      case "hold": return "Hold";
      case "exhale": return "Breathe Out";
      case "complete": return "Well Done!";
      default: return "Ready to begin";
    }
  };

  const getCircleSize = () => {
    switch (phase) {
      case "inhale": return "scale-125";
      case "hold": return "scale-125";
      case "exhale": return "scale-100";
      default: return "scale-100";
    }
  };

  if (completed) {
    return (
      <div className="flex items-center justify-center p-6 bg-primary/10 rounded-xl">
        <div className="flex items-center gap-3 text-primary">
          <Check className="h-6 w-6" />
          <span className="font-medium">Breathing exercise completed!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-card/50 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wind className="h-5 w-5 text-primary" />
          <span className="font-medium">Deep Breathing (4-4-4)</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {round > 0 ? `Round ${round}/${totalRounds}` : `${totalRounds} rounds`}
        </span>
      </div>

      <div className="flex flex-col items-center justify-center py-8">
        <div
          className={cn(
            "w-32 h-32 rounded-full bg-primary/20 flex items-center justify-center transition-transform duration-1000 ease-in-out",
            getCircleSize()
          )}
        >
          <div className="w-20 h-20 rounded-full bg-primary/40 flex items-center justify-center">
            <span className="text-3xl font-bold text-primary">
              {phase !== "idle" && phase !== "complete" ? count : ""}
            </span>
          </div>
        </div>
        
        <p className="mt-6 text-xl font-semibold text-foreground">
          {getPhaseInstruction()}
        </p>
      </div>

      <div className="flex justify-center gap-3">
        {phase === "idle" ? (
          <Button onClick={startExercise} className="gap-2">
            <Play className="h-4 w-4" />
            Start Exercise
          </Button>
        ) : phase !== "complete" ? (
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        ) : null}
      </div>
    </div>
  );
};
