import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
}

export const ProgressIndicator = ({ steps, currentStep, completedSteps }: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-2 py-4">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index);
        const isCurrent = currentStep === index;
        
        return (
          <div key={step} className="flex items-center">
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300",
                isCompleted
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                  ? "bg-primary/30 text-primary ring-2 ring-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="h-4 w-4" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-8 h-1 mx-1 rounded-full transition-colors",
                  completedSteps.includes(index) ? "bg-primary" : "bg-muted"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};
