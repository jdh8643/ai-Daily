import { Header } from "@/components/Header";
import { DiaryInput } from "@/components/DiaryInput";
import { DiaryEntry } from "@/components/DiaryEntry";
import { EmotionGraph } from "@/components/diary/EmotionGraph";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Smile, Frown, Angry, Meh } from "lucide-react";
import { cn } from "@/lib/utils";

const DiaryList = () => {
  const [entries, setEntries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);

  const emotions = [
    { value: "", label: "전체", icon: null, color: "" },
    { value: "1", label: "기쁨", icon: Smile, color: "text-yellow-500" },
    { value: "2", label: "슬픔", icon: Frown, color: "text-blue-500" },
    { value: "3", label: "분노", icon: Angry, color: "text-red-500" },
    { value: "4", label: "우울함", icon: Meh, color: "text-purple-500" },
  ];

  const fetchEntries = async () => {
    try {
      let query = supabase
        .from('chat_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (selectedEmotion) {
        query = query.eq('rating', parseInt(selectedEmotion));
      }

      const { data, error } = await query;

      if (error) throw error;
      setEntries(data);
    } catch (error) {
      console.error('Error fetching entries:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [selectedEmotion]);

  useEffect(() => {
    const channel = supabase
      .channel('chat_messages_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'chat_messages' 
        }, 
        () => {
          fetchEntries();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = () => {
    fetchEntries();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
        <Header />
        <main className="container mx-auto px-4 py-8">
          <div className="text-center">로딩 중...</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <div className="max-w-2xl mx-auto space-y-8">
          <EmotionGraph entries={entries} />
          
          <div className="space-y-4 fade-in">
            <h2 className="text-xl font-semibold tracking-tight">감정 필터</h2>
            <RadioGroup
              value={selectedEmotion || ""}
              onValueChange={setSelectedEmotion}
              className="flex flex-wrap gap-4"
            >
              {emotions.map((emotion) => {
                const Icon = emotion.icon;
                return (
                  <div key={emotion.value} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={emotion.value}
                      id={`emotion-${emotion.value}`}
                    />
                    <Label
                      htmlFor={`emotion-${emotion.value}`}
                      className={cn(
                        "flex items-center gap-1 cursor-pointer",
                        emotion.color
                      )}
                    >
                      {Icon && <Icon className="w-4 h-4" />}
                      {emotion.label}
                    </Label>
                  </div>
                );
              })}
            </RadioGroup>
          </div>

          <h2 className="text-xl font-semibold tracking-tight mb-4 fade-in">
            {selectedEmotion ? `${emotions.find(e => e.value === selectedEmotion)?.label} 일기 목록` : '전체 일기 목록'}
          </h2>
          
          {entries.length === 0 ? (
            <p className="text-center text-muted-foreground">
              {selectedEmotion ? '해당 감정의 일기가 없습니다.' : '아직 작성된 일기가 없습니다.'}
            </p>
          ) : (
            entries.map((entry) => (
              <DiaryEntry
                key={entry.id}
                id={entry.id}
                date={format(new Date(entry.created_at), "yyyy년 MM월 dd일")}
                content={entry.content}
                rating={entry.rating}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default DiaryList;