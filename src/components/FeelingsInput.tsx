import { cn } from "@/lib/utils";
import { X } from "lucide-react";

interface FeelingsInputProps {
  value: string[];
  onChange: (feelings: string[]) => void;
}

const suggestedFeelings = [
  "Peaceful", "Anxious", "Grateful", "Tired", "Excited",
  "Hopeful", "Stressed", "Calm", "Energized", "Overwhelmed",
  "Content", "Restless", "Optimistic", "Sluggish", "Motivated"
];

export const FeelingsInput = ({ value, onChange }: FeelingsInputProps) => {
  const toggleFeeling = (feeling: string) => {
    if (value.includes(feeling)) {
      onChange(value.filter(f => f !== feeling));
    } else if (value.length < 5) {
      onChange([...value, feeling]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {suggestedFeelings.map((feeling) => (
          <button
            key={feeling}
            type="button"
            onClick={() => toggleFeeling(feeling)}
            className={cn(
              "px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200",
              value.includes(feeling)
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-card hover:bg-muted text-foreground"
            )}
          >
            {feeling}
          </button>
        ))}
      </div>
      
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">Selected:</span>
          {value.map((feeling) => (
            <span
              key={feeling}
              className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary rounded-full text-sm"
            >
              {feeling}
              <button
                type="button"
                onClick={() => toggleFeeling(feeling)}
                className="hover:bg-primary/30 rounded-full p-0.5"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
      
      <p className="text-xs text-muted-foreground">
        Select up to 5 feelings ({value.length}/5)
      </p>
    </div>
  );
};
