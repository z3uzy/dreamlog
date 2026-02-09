import { Layout } from "@/components/Layout";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit } from "lucide-react";

export default function Notes() {
  const [notes, setNotes] = useState<{id: string, text: string, date: string}[]>([
      { id: "1", text: "Focus on form for deadlifts next session. Keep back straight.", date: new Date().toISOString() }
  ]);
  const [newNote, setNewNote] = useState("");

  const addNote = () => {
    if (!newNote.trim()) return;
    setNotes(prev => [{ id: crypto.randomUUID(), text: newNote, date: new Date().toISOString() }, ...prev]);
    setNewNote("");
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
  };

  return (
    <Layout>
      <div className="p-4 space-y-6 max-w-md mx-auto animate-in fade-in duration-500">
        <h1 className="text-2xl font-bold font-heading">Notes & Journal</h1>

        <div className="bg-card border border-border rounded-2xl p-4 shadow-sm space-y-3">
             <textarea 
                className="w-full bg-secondary/30 border-none rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[100px] resize-none"
                placeholder="Write a thought, goal, or reminder..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
            />
            <div className="flex justify-end">
                <Button size="sm" onClick={addNote} disabled={!newNote.trim()}>
                    <Plus size={16} className="mr-1" /> Add Note
                </Button>
            </div>
        </div>

        <div className="space-y-4">
             {notes.map(note => (
                 <div key={note.id} className="group relative bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors">
                     <p className="text-sm whitespace-pre-wrap">{note.text}</p>
                     <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                         {new Date(note.date).toLocaleDateString()}
                     </p>
                     <Button 
                        variant="ghost" 
                        size="icon" 
                        className="absolute top-2 right-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:bg-destructive/10"
                        onClick={() => deleteNote(note.id)}
                    >
                        <Trash2 size={12} />
                     </Button>
                 </div>
             ))}
        </div>
      </div>
    </Layout>
  );
}
