import { Slider } from "@/components/ui/slider";
import { Moon } from "lucide-react";

interface SleepSliderProps {
  value: number;
  onChange: (hours: number) => void;
}

export const SleepSlider = ({ value, onChange }: SleepSliderProps) => {
  const getSleepQuality = (hours: number) => {
    if (hours < 5) return { text: "Need more rest", color: "text-destructive" };
    if (hours < 7) return { text: "Could be better", color: "text-accent-foreground" };
    if (hours <= 9) return { text: "Well rested!", color: "text-primary" };
    return { text: "Plenty of sleep", color: "text-primary" };
  };

  const quality = getSleepQuality(value);

  return (
    <div className="space-y-4 p-4 bg-card/50 rounded-xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Moon className="h-5 w-5 text-primary" />
          <span className="font-medium">Hours of Sleep</span>
        </div>
        <div className="text-right">
          <span className="text-2xl font-bold text-primary">{value}</span>
          <span className="text-muted-foreground ml-1">hours</span>
        </div>
      </div>
      
      <Slider
        value={[value]}
        onValueChange={([v]) => onChange(v)}
        min={0}
        max={12}
        step={0.5}
        className="py-2"
      />
      
      <p className={`text-sm text-center ${quality.color} font-medium`}>
        {quality.text}
      </p>
    </div>
  );
};
