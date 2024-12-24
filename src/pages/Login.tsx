import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { AuthChangeEvent, Session } from "@supabase/supabase-js";

const Login = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === 'SIGNED_IN' && session) {
        toast({
          title: "로그인 성공",
          description: "환영합니다!",
        });
        navigate("/");
      }
      if (event === 'SIGNED_OUT') {
        navigate("/login");
      }
      if (event === 'PASSWORD_RECOVERY') {
        toast({
          title: "비밀번호 복구",
          description: "이메일을 확인해주세요.",
        });
      }
      if (event === 'USER_UPDATED') {
        toast({
          title: "계정이 업데이트되었습니다",
        });
      }
      // Handle authentication errors
      if (event === 'AUTH_ERROR') {
        toast({
          title: "로그인 오류",
          description: "이메일과 비밀번호를 확인해주세요.",
          variant: "destructive",
        });
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8">
        <h1 className="text-2xl font-bold text-center mb-8">AI Diary 로그인</h1>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#000000',
                  brandAccent: '#333333',
                },
              },
            },
            style: {
              button: {
                borderRadius: '6px',
                padding: '10px 15px',
              },
              input: {
                borderRadius: '6px',
              },
              anchor: {
                color: '#666666',
              },
            },
          }}
          localization={{
            variables: {
              sign_in: {
                email_label: '이메일',
                password_label: '비밀번호',
                button_label: '로그인',
                loading_button_label: '로그인 중...',
                social_provider_text: '다음으로 계속하기',
                link_text: '이미 계정이 있으신가요? 로그인',
              },
              sign_up: {
                email_label: '이메일',
                password_label: '비밀번호',
                button_label: '회원가입',
                loading_button_label: '회원가입 중...',
                link_text: '계정이 없으신가요? 회원가입',
              },
            },
          }}
          view="sign_in"
          providers={[]}
        />
      </div>
    </div>
  );
};

export default Login;