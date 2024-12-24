import { useState } from "react";
import { Smile, Frown, Angry, Meh } from "lucide-react";
import { cn } from "@/lib/utils";

interface RatingInputProps {
  value: number | null;
  onChange: (rating: number) => void;
}

export const RatingInput = ({ value, onChange }: RatingInputProps) => {
  const [hover, setHover] = useState<number | null>(null);

  const emotions = [
    { icon: Smile, label: "기쁨", value: 1, color: "text-yellow-500" },
    { icon: Frown, label: "슬픔", value: 2, color: "text-blue-500" },
    { icon: Angry, label: "분노", value: 3, color: "text-red-500" },
    { icon: Meh, label: "우울함", value: 4, color: "text-purple-500" },
  ];

  return (
    <div className="flex items-center gap-4">
      {emotions.map((emotion) => {
        const Icon = emotion.icon;
        const isSelected = value === emotion.value;
        const isHovered = hover === emotion.value;

        return (
          <button
            key={emotion.value}
            type="button"
            className="flex flex-col items-center gap-1 p-2 rounded-lg hover:bg-accent transition-colors"
            onMouseEnter={() => setHover(emotion.value)}
            onMouseLeave={() => setHover(null)}
            onClick={() => onChange(emotion.value)}
          >
            <Icon
              className={cn(
                "w-8 h-8 transition-colors",
                isSelected || isHovered ? emotion.color : "text-muted-foreground"
              )}
            />
            <span className={cn(
              "text-xs transition-colors",
              isSelected || isHovered ? emotion.color : "text-muted-foreground"
            )}>
              {emotion.label}
            </span>
          </button>
        );
      })}
    </div>
  );
};