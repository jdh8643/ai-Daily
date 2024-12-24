import { Header } from "@/components/Header";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CalendarStats from "@/components/calendar/CalendarStats";

const Calendar = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState([]);
  const [editingEvent, setEditingEvent] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: ''
  });

  const fetchEvents = async () => {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) {
      console.error('Error fetching events:', error);
      return;
    }
    
    setEvents(data);
  };

  const toggleEventCompletion = async (eventId: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('calendar_events')
      .update({ completed: !currentStatus })
      .eq('id', eventId);

    if (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event status');
      return;
    }

    toast.success('Event status updated');
    fetchEvents();
  };

  const handleEditClick = (event) => {
    setEditingEvent(event);
    setEditForm({
      title: event.title,
      description: event.description || ''
    });
    setIsEditDialogOpen(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    
    const { error } = await supabase
      .from('calendar_events')
      .update({
        title: editForm.title,
        description: editForm.description
      })
      .eq('id', editingEvent.id);

    if (error) {
      console.error('Error updating event:', error);
      toast.error('Failed to update event');
      return;
    }

    toast.success('Event updated successfully');
    setIsEditDialogOpen(false);
    fetchEvents();
  };

  const handleDelete = async (eventId: string) => {
    if (!confirm('Are you sure you want to delete this event?')) {
      return;
    }

    const { error } = await supabase
      .from('calendar_events')
      .delete()
      .eq('id', eventId);

    if (error) {
      console.error('Error deleting event:', error);
      toast.error('Failed to delete event');
      return;
    }

    toast.success('Event deleted successfully');
    fetchEvents();
  };

  useEffect(() => {
    fetchEvents();

    const channel = supabase
      .channel('calendar_events_changes')
      .on('postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'calendar_events'
        },
        () => {
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto flex flex-col items-center">
          <div className="glass-panel p-6 w-full max-w-xl">
            <div className="flex justify-center mb-6">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border bg-white/50"
              />
            </div>
            <div className="mt-4">
              <h3 className="font-medium mb-2">이날의 일정:</h3>
              {events
                .filter(event => event.date === format(date || new Date(), 'yyyy-MM-dd'))
                .map(event => (
                  <div key={event.id} className="p-4 bg-white/30 rounded-md mb-2 flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className={`font-medium ${event.completed ? 'line-through text-red-500' : ''}`}>
                        {event.title}
                      </h4>
                      {event.description && (
                        <p className={`text-sm text-gray-600 mt-2 ${event.completed ? 'line-through text-red-500' : ''}`}>
                          {event.description}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`event-${event.id}`}
                        checked={event.completed}
                        onCheckedChange={() => toggleEventCompletion(event.id, event.completed)}
                        className="h-5 w-5"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEditClick(event)}
                        className="h-8 w-8"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(event.id)}
                        className="h-8 w-8 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Add Statistics Section */}
          <CalendarStats events={events} />
        </div>
      </main>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>일정 수정</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium mb-1">
                제목
              </label>
              <Input
                id="title"
                value={editForm.title}
                onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                설명
              </label>
              <Textarea
                id="description"
                value={editForm.description}
                onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)} className="hover:bg-primary/10">
                취소
              </Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90">
                저장
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Calendar;
