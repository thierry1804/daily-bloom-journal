import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface DayRatingProps {
  value: number;
  onChange: (rating: number) => void;
}

export const DayRating = ({ value, onChange }: DayRatingProps) => {
  const getRatingText = (rating: number) => {
    if (rating === 0) return "How was your day?";
    if (rating <= 2) return "Challenging day";
    if (rating <= 4) return "Okay day";
    if (rating <= 6) return "Good day";
    if (rating <= 8) return "Great day!";
    return "Amazing day!";
  };

  return (
    <div className="space-y-4 p-4 bg-card/50 rounded-xl">
      <p className="text-center font-medium text-lg">
        {getRatingText(value)}
      </p>
      
      <div className="flex justify-center gap-1">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 transition-transform hover:scale-110 focus:outline-none"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                star <= value
                  ? "fill-primary text-primary"
                  : "text-muted hover:text-primary/50"
              )}
            />
          </button>
        ))}
      </div>
      
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>Rough</span>
        <span>Amazing</span>
      </div>
    </div>
  );
};
