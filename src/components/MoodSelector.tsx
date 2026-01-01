import { cn } from "@/lib/utils";

interface MoodSelectorProps {
  value: number;
  onChange: (mood: number) => void;
}

const moods = [
  { value: 1, emoji: "😔", label: "Struggling" },
  { value: 2, emoji: "😕", label: "Low" },
  { value: 3, emoji: "😐", label: "Neutral" },
  { value: 4, emoji: "🙂", label: "Good" },
  { value: 5, emoji: "😊", label: "Great" },
];

export const MoodSelector = ({ value, onChange }: MoodSelectorProps) => {
  return (
    <div className="space-y-3">
      <div className="flex justify-between gap-1 sm:gap-2">
        {moods.map((mood) => (
          <button
            key={mood.value}
            type="button"
            onClick={() => onChange(mood.value)}
            className={cn(
              "flex flex-col items-center p-2 sm:p-3 rounded-xl transition-all duration-300 flex-1 min-w-0",
              "hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50",
              value === mood.value
                ? "bg-primary/20 ring-2 ring-primary shadow-lg scale-105"
                : "bg-card/50 hover:bg-card"
            )}
          >
            <span className="text-2xl sm:text-3xl mb-0.5 sm:mb-1" role="img" aria-label={mood.label}>
              {mood.emoji}
            </span>
            <span className="text-[10px] sm:text-xs text-muted-foreground font-medium truncate w-full text-center">
              {mood.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
