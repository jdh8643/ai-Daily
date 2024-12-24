import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingInput } from "./RatingInput";

interface DiaryFormProps {
  onSubmit: (content: string, rating: number | null) => Promise<void>;
  isLoading: boolean;
}

export const DiaryForm = ({ onSubmit, isLoading }: DiaryFormProps) => {
  const [entry, setEntry] = useState("");
  const [rating, setRating] = useState<number | null>(null);

  const handleSubmit = async () => {
    await onSubmit(entry, rating);
    setEntry("");
    setRating(null);
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="오늘 하루는 어땠나요? 자유롭게 적어보세요..."
        className="min-h-[200px] resize-none bg-white/50 border-white/20"
        value={entry}
        onChange={(e) => setEntry(e.target.value)}
      />
      <div className="flex items-center justify-between">
        <RatingInput value={rating} onChange={setRating} />
        <Button 
          onClick={handleSubmit}
          className="transition-all hover:shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? "저장 중..." : "일기 작성하기"}
        </Button>
      </div>
    </div>
  );
};