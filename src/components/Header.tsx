import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

export const Header = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "로그아웃 되었습니다",
        description: "다음에 또 만나요!",
      });
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "로그아웃 중 오류가 발생했습니다",
        description: "잠시 후 다시 시도해주세요",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <header className="w-full py-6 px-4 glass-panel mb-8">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold tracking-tight">AI Diary</h1>
          <div className="animate-pulse bg-gray-200 h-10 w-24 rounded" />
        </div>
      </header>
    );
  }

  return (
    <header className="w-full py-6 px-4 glass-panel mb-8">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-6">
          <h1 className="text-2xl font-bold tracking-tight">AI Diary</h1>
          {user && (
            <nav className="flex space-x-4">
              <Button variant="ghost" onClick={() => navigate("/")}>일기 작성</Button>
              <Button variant="ghost" onClick={() => navigate("/diary")}>일기 목록</Button>
              <Button variant="ghost" onClick={() => navigate("/calendar")}>캘린더</Button>
            </nav>
          )}
        </div>
        <div className="space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:bg-primary/10">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={user.user_metadata.avatar_url} alt={user.email} />
                    <AvatarFallback>{user.email?.charAt(0).toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive">로그아웃</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Button 
                variant="ghost" 
                onClick={() => navigate("/login")}
                className="hover:bg-primary/10"
              >
                로그인
              </Button>
              <Button 
                onClick={() => navigate("/signup")}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                시작하기
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};
