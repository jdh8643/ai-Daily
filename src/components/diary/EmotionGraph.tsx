import { useMemo, useState } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { format, subMonths, isAfter, isBefore, startOfMonth, endOfMonth, addMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface EmotionGraphProps {
  entries: Array<{
    created_at: string;
    rating: number | null;
  }>;
}

const getEmotionLabel = (rating: number): string => {
  switch (rating) {
    case 1:
      return "기쁨";
    case 2:
      return "슬픔";
    case 3:
      return "분노";
    case 4:
      return "우울함";
    default:
      return "알 수 없음";
  }
};

const getEmotionColor = (emotion: string): string => {
  switch (emotion) {
    case "기쁨":
      return "#FEF7CD"; // Soft Yellow
    case "슬픔":
      return "#D3E4FD"; // Soft Blue
    case "분노":
      return "#FEC6A1"; // Soft Orange
    case "우울함":
      return "#E5DEFF"; // Soft Purple
    default:
      return "#F3F4F6"; // Light Gray
  }
};

export const EmotionGraph = ({ entries }: EmotionGraphProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const chartData = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    
    const filteredEntries = entries.filter(entry => {
      const entryDate = new Date(entry.created_at);
      return isAfter(entryDate, monthStart) && isBefore(entryDate, monthEnd);
    });

    const emotionCounts = filteredEntries.reduce((acc: { [key: string]: number }, entry) => {
      if (entry.rating) {
        const emotion = getEmotionLabel(entry.rating);
        acc[emotion] = (acc[emotion] || 0) + 1;
      }
      return acc;
    }, {});

    return Object.entries(emotionCounts).map(([emotion, count]) => ({
      emotion,
      count,
      fill: getEmotionColor(emotion),
    }));
  }, [entries, currentMonth]);

  const chartConfig = {
    기쁨: { color: "#FEF7CD" },
    슬픔: { color: "#D3E4FD" },
    분노: { color: "#FEC6A1" },
    우울함: { color: "#E5DEFF" },
  };

  const handlePreviousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    const nextMonth = addMonths(currentMonth, 1);
    if (isBefore(nextMonth, addMonths(new Date(), 1))) {
      setCurrentMonth(nextMonth);
    }
  };

  const isCurrentMonth = format(currentMonth, 'yyyy-MM') === format(new Date(), 'yyyy-MM');

  return (
    <div className="w-full h-64 bg-white/50 rounded-lg p-4 glass-panel">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {format(currentMonth, 'yyyy년 MM월')}의 감정 분포
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            disabled={isCurrentMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <ChartContainer config={chartConfig} className="w-full h-full">
        <ResponsiveContainer>
          <BarChart data={chartData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
            <XAxis dataKey="emotion" />
            <YAxis />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="count"
              radius={[4, 4, 0, 0]}
            >
              {chartData.map((entry, index) => (
                <Bar
                  key={`bar-${index}`}
                  dataKey="count"
                  fill={entry.fill}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>
    </div>
  );
};