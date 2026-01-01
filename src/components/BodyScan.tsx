import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Scan, Play, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BodyScanProps {
  onComplete: () => void;
  completed: boolean;
}

const bodyParts = [
  { name: "Head & Face", duration: 10, instruction: "Relax your forehead, jaw, and facial muscles" },
  { name: "Neck & Shoulders", duration: 10, instruction: "Release any tension in your neck and drop your shoulders" },
  { name: "Arms & Hands", duration: 10, instruction: "Feel the weight of your arms, relax your fingers" },
  { name: "Chest & Stomach", duration: 10, instruction: "Notice your breathing, let your belly soften" },
  { name: "Back & Spine", duration: 10, instruction: "Feel your back supported, release any tightness" },
  { name: "Legs & Feet", duration: 10, instruction: "Relax your thighs, calves, and feet completely" },
];

export const BodyScan = ({ onComplete, completed }: BodyScanProps) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isComplete, setIsComplete] = useState(completed);

  const totalDuration = bodyParts.reduce((sum, part) => sum + part.duration, 0);
  const elapsedDuration = bodyParts.slice(0, currentIndex).reduce((sum, part) => sum + part.duration, 0) + 
    (isRunning ? bodyParts[currentIndex]?.duration - timeRemaining : 0);
  const progress = (elapsedDuration / totalDuration) * 100;

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev > 1) return prev - 1;
        
        if (currentIndex < bodyParts.length - 1) {
          setCurrentIndex(i => i + 1);
          return bodyParts[currentIndex + 1].duration;
        } else {
          setIsRunning(false);
          setIsComplete(true);
          onComplete();
          return 0;
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, currentIndex, onComplete]);

  const start = () => {
    setCurrentIndex(0);
    setTimeRemaining(bodyParts[0].duration);
    setIsRunning(true);
  };

  if (isComplete || completed) {
    return (
      <div className="flex items-center justify-center p-6 bg-primary/10 rounded-xl">
        <div className="flex items-center gap-3 text-primary">
          <Check className="h-6 w-6" />
          <span className="font-medium">Body scan completed!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-card/50 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Scan className="h-5 w-5 text-primary" />
          <span className="font-medium">60-Second Body Scan</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {isRunning ? `${Math.ceil(timeRemaining)}s` : "1 minute"}
        </span>
      </div>

      {isRunning ? (
        <>
          <Progress value={progress} className="h-2" />
          
          <div className="text-center py-4">
            <p className="text-lg font-semibold text-primary mb-2">
              {bodyParts[currentIndex].name}
            </p>
            <p className="text-muted-foreground">
              {bodyParts[currentIndex].instruction}
            </p>
          </div>

          <div className="flex justify-center gap-2">
            {bodyParts.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index < currentIndex
                    ? "bg-primary"
                    : index === currentIndex
                    ? "bg-primary animate-pulse"
                    : "bg-muted"
                }`}
              />
            ))}
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-muted-foreground text-center">
            A guided journey through your body, releasing tension with each breath
          </p>
          <Button onClick={start} className="gap-2">
            <Play className="h-4 w-4" />
            Begin Body Scan
          </Button>
        </div>
      )}
    </div>
  );
};
