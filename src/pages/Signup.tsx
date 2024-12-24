import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-panel p-8">
        <h1 className="text-2xl font-bold text-center mb-8">AI Diary 시작하기</h1>
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
          }}
          view="sign_up"
          providers={[]}
          localization={{
            variables: {
              sign_up: {
                email_label: '이메일',
                password_label: '비밀번호',
                button_label: '가입하기',
                loading_button_label: '가입 중...',
                social_provider_text: '다음으로 계속하기',
                link_text: '계정이 없으신가요? 가입하기',
              },
            },
          }}
        />
      </div>
    </div>
  );
};

export default Signup;