import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, X, Check, Smile, Frown, Angry, Meh } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface DiaryEntryProps {
  id: string;
  date: string;
  content: string;
  rating?: number | null;
  onDelete: () => void;
}

export const DiaryEntry = ({ id, date, content, rating, onDelete }: DiaryEntryProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(content);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const emotions = [
    { icon: Smile, label: "기쁨", value: 1, color: "text-yellow-500" },
    { icon: Frown, label: "슬픔", value: 2, color: "text-blue-500" },
    { icon: Angry, label: "분노", value: 3, color: "text-red-500" },
    { icon: Meh, label: "우울함", value: 4, color: "text-purple-500" },
  ];

  const getEmotion = (rating: number | null | undefined) => {
    return emotions.find(emotion => emotion.value === rating);
  };

  const handleUpdate = async () => {
    if (!editedContent.trim()) {
      toast({
        title: "내용을 입력해주세요",
        description: "일기 내용이 비어있습니다",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .update({ content: editedContent })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "일기가 수정되었습니다",
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "오류가 발생했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("정말로 이 일기를 삭제하시겠습니까?")) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "일기가 삭제되었습니다",
      });
      onDelete();
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "오류가 발생했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const emotion = getEmotion(rating);
  const EmotionIcon = emotion?.icon;

  return (
    <Card className="glass-panel slide-in">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-lg font-medium">{date}</CardTitle>
          {emotion && EmotionIcon && (
            <div className="flex items-center gap-1" title={emotion.label}>
              <EmotionIcon className={cn("w-5 h-5", emotion.color)} />
              <span className={cn("text-xs", emotion.color)}>
                {emotion.label}
              </span>
            </div>
          )}
        </div>
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsEditing(true)}
                disabled={isLoading}
                className="hover:bg-primary/10"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleDelete}
                disabled={isLoading}
                className="hover:bg-destructive/10"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleUpdate}
                disabled={isLoading}
                className="hover:bg-primary/10"
              >
                <Check className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setIsEditing(false);
                  setEditedContent(content);
                }}
                disabled={isLoading}
                className="hover:bg-primary/10"
              >
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {isEditing ? (
          <Textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            className="min-h-[100px] resize-none bg-white/50 border-white/20"
            disabled={isLoading}
          />
        ) : (
          <p className="text-sm leading-relaxed">{content}</p>
        )}
      </CardContent>
    </Card>
  );
};
