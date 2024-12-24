import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { DiaryForm } from "./diary/DiaryForm";
import { CalendarForm } from "./diary/CalendarForm";
import { format } from "date-fns";

export const DiaryInput = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [user, setUser] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/login");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleDiarySubmit = async (content: string, rating: number | null) => {
    if (!content.trim()) {
      toast({
        title: "내용을 입력해주세요",
        description: "일기 내용이 비어있습니다",
        variant: "destructive",
      });
      return;
    }
    
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "일기를 작성하려면 먼저 로그인해주세요",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('chat_messages')
        .insert([
          { content, rating, user_id: user.id }
        ]);

      if (error) throw error;

      toast({
        title: "일기가 저장되었습니다",
      });
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

  const handleCalendarSubmit = async (date: Date, schedule: string) => {
    if (!user) {
      toast({
        title: "로그인이 필요합니다",
        description: "일정을 추가하려면 먼저 로그인해주세요",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!schedule.trim()) {
      toast({
        title: "일정을 입력해주세요",
        description: "일정 내용이 비어있습니다",
        variant: "destructive",
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('calendar_events')
        .insert([
          { 
            date: format(date, 'yyyy-MM-dd'),
            title: schedule,
            user_id: user.id 
          }
        ]);

      if (error) throw error;

      toast({
        title: "일정이 추가되었습니다",
        description: "캘린더에서 확인하실 수 있습니다",
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "오류가 발생했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4 fade-in">
      <div className="glass-panel p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">오늘의 일기</h2>
          <p className="text-sm text-muted-foreground">
            오늘 하루 있었던 일을 자유롭게 적어보세요.
          </p>
        </div>
        <DiaryForm onSubmit={handleDiarySubmit} isLoading={isLoading} />
      </div>

      <div className="glass-panel p-6 space-y-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold tracking-tight">캘린더에 일정 추가하기</h2>
          <p className="text-sm text-muted-foreground">
            일정을 추가하고 캘린더에서 확인해보세요.
          </p>
        </div>
        <CalendarForm onSubmit={handleCalendarSubmit} />
      </div>
    </div>
  );
};
