import { Textarea } from "@/components/ui/textarea";
import { Heart } from "lucide-react";

interface GratitudeInputProps {
  value: [string, string, string];
  onChange: (gratitude: [string, string, string]) => void;
}

export const GratitudeInput = ({ value, onChange }: GratitudeInputProps) => {
  const updateGratitude = (index: number, text: string) => {
    const newValue: [string, string, string] = [...value] as [string, string, string];
    newValue[index] = text;
    onChange(newValue);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-primary">
        <Heart className="h-5 w-5" />
        <p className="text-sm text-muted-foreground">
          Three things you're grateful for today
        </p>
      </div>
      
      {[0, 1, 2].map((index) => (
        <div key={index} className="relative">
          <span className="absolute left-3 top-3 text-primary font-semibold">
            {index + 1}.
          </span>
          <Textarea
            value={value[index]}
            onChange={(e) => updateGratitude(index, e.target.value)}
            placeholder={`I'm grateful for...`}
            className="pl-8 min-h-[60px] resize-none bg-card/50 border-border/50 focus:border-primary transition-colors"
            maxLength={150}
          />
        </div>
      ))}
    </div>
  );
};
