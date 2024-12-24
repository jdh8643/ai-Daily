import { Header } from "@/components/Header";
import { DiaryInput } from "@/components/DiaryInput";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Header />
      <main className="container mx-auto px-4 py-8 space-y-8">
        <DiaryInput />
      </main>
    </div>
  );
};

export default Index;