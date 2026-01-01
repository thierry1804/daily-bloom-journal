import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  completedSteps: number[];
}

export const ProgressIndicator = ({ steps, currentStep, completedSteps }: ProgressIndicatorProps) => {
  return (
    <div className="flex items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 overflow-x-auto">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index);
        const isCurrent = currentStep === index;
        
        return (
          <div key={step} className="flex items-center flex-shrink-0">
            <div
              className={cn(
                "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center transition-all duration-300",
                isCompleted
                  ? "bg-primary text-primary-foreground"
                  : isCurrent
                  ? "bg-primary/30 text-primary ring-2 ring-primary"
                  : "bg-muted text-muted-foreground"
              )}
            >
              {isCompleted ? (
                <Check className="h-3 w-3 sm:h-4 sm:w-4" />
              ) : (
                <span className="text-xs sm:text-sm font-medium">{index + 1}</span>
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div
                className={cn(
                  "w-4 sm:w-8 h-0.5 sm:h-1 mx-0.5 sm:mx-1 rounded-full transition-colors",
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
