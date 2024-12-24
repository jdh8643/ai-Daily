import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, addMonths, subMonths, isAfter, isBefore } from 'date-fns';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from 'recharts';
import { Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";

interface CalendarStatsProps {
  events: Array<{
    id: string;
    title: string;
    date: string;
    completed: boolean;
    description?: string | null;
  }>;
}

const CalendarStats = ({ events }: CalendarStatsProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const statsData = events.reduce((acc: any[], event) => {
    const eventDate = new Date(event.date);
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    // Only include events from the selected month
    if (!isAfter(eventDate, monthStart) || !isBefore(eventDate, monthEnd)) {
      return acc;
    }

    const date = format(eventDate, 'MM/dd');
    const existingDate = acc.find(item => item.date === date);
    
    if (existingDate) {
      if (event.completed) {
        existingDate.completed += 1;
      } else {
        existingDate.incomplete += 1;
      }
    } else {
      acc.push({
        date,
        completed: event.completed ? 1 : 0,
        incomplete: event.completed ? 0 : 1
      });
    }
    return acc;
  }, []);

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

  const filteredEvents = events.filter(event => {
    const eventDate = new Date(event.date);
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    return isAfter(eventDate, monthStart) && isBefore(eventDate, monthEnd);
  });

  return (
    <div className="mt-8 space-y-6 glass-panel p-6 fade-in max-w-[calc(100vw-2rem)] mx-auto" style={{ width: 'var(--calendar-width, 100%)' }}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-800">
          {format(currentMonth, 'yyyy년 MM월')}의 일정 통계
        </h2>
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
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 h-[300px] slide-in">
          <ResponsiveContainer width="100%" height="100%">
            <ChartContainer
              config={{
                completed: { color: '#22c55e' },
                incomplete: { color: '#ef4444' },
              }}
            >
              <BarChart data={statsData}>
                <XAxis 
                  dataKey="date" 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#6b7280"
                  fontSize={12}
                />
                <Bar 
                  dataKey="completed" 
                  stackId="a" 
                  fill="#22c55e"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="incomplete" 
                  stackId="a" 
                  fill="#ef4444"
                  radius={[4, 4, 0, 0]}
                />
                <ChartTooltip 
                  cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                  contentStyle={{
                    background: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                  }}
                />
              </BarChart>
            </ChartContainer>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-3 p-4 bg-white/50 rounded-lg shadow-sm">
            <h3 className="font-medium flex items-center gap-2 text-gray-800">
              <Check className="h-5 w-5 text-green-500" />
              완료된 일정
            </h3>
            <div className="space-y-2 max-h-[120px] overflow-y-auto">
              {filteredEvents
                .filter(event => event.completed)
                .map(event => (
                  <div 
                    key={event.id} 
                    className="text-sm text-gray-600 p-2 hover:bg-white/50 rounded-md transition-colors"
                  >
                    {format(new Date(event.date), 'yyyy/MM/dd')} - {event.title}
                  </div>
                ))}
            </div>
          </div>
          
          <div className="space-y-3 p-4 bg-white/50 rounded-lg shadow-sm">
            <h3 className="font-medium flex items-center gap-2 text-gray-800">
              <X className="h-5 w-5 text-red-500" />
              미완료 일정
            </h3>
            <div className="space-y-2 max-h-[120px] overflow-y-auto">
              {filteredEvents
                .filter(event => !event.completed)
                .map(event => (
                  <div 
                    key={event.id} 
                    className="text-sm text-gray-600 p-2 hover:bg-white/50 rounded-md transition-colors"
                  >
                    {format(new Date(event.date), 'yyyy/MM/dd')} - {event.title}
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CalendarStats;