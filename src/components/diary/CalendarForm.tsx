import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CalendarFormProps {
  onSubmit: (date: Date, schedule: string) => Promise<void>;
}

export const CalendarForm = ({ onSubmit }: CalendarFormProps) => {
  const [date, setDate] = useState<Date>(new Date());
  const [schedule, setSchedule] = useState("");

  const handleSubmit = async () => {
    await onSubmit(date, schedule);
    setSchedule("");
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={"outline"}
              className={cn(
                "w-full justify-start text-left font-normal bg-white/50 border-white/20",
                !date && "text-muted-foreground"
              )}
            >
              <CalendarIcon className="mr-2 h-4 w-4" />
              {date ? format(date, "PPP") : <span>날짜를 선택하세요</span>}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              mode="single"
              selected={date}
              onSelect={(newDate) => setDate(newDate || new Date())}
              initialFocus
            />
          </PopoverContent>
        </Popover>
        <Input
          placeholder="일정을 입력하세요"
          value={schedule}
          onChange={(e) => setSchedule(e.target.value)}
          className="bg-white/50 border-white/20"
        />
      </div>
      <Button 
        onClick={handleSubmit}
        className="w-full transition-all hover:shadow-lg bg-primary text-primary-foreground hover:bg-primary/90"
      >
        일정 추가하기
      </Button>
    </div>
  );
};
