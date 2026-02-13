import { Layout } from "@/components/Layout";
import { useApp } from "@/lib/store";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit, X, Check } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";

export default function Notes() {
  const { globalNotes, addNote, updateNote, deleteNote } = useApp();
  const [newNote, setNewNote] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    addNote(newNote);
    setNewNote("");
  };

  const startEdit = (id: string, text: string) => {
      setEditingId(id);
      setEditText(text);
  };

  const saveEdit = (id: string) => {
      if (editText.trim()) {
          updateNote(id, editText);
      }
      setEditingId(null);
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
                <Button size="sm" onClick={handleAddNote} disabled={!newNote.trim()}>
                    <Plus size={16} className="mr-1" /> Add Note
                </Button>
            </div>
        </div>

        <div className="space-y-4">
             {globalNotes.map(note => (
                 <div key={note.id} className="group relative bg-card border border-border rounded-2xl p-4 hover:border-primary/30 transition-colors">
                     {editingId === note.id ? (
                        <div className="space-y-2">
                            <textarea 
                                className="w-full bg-secondary/50 border border-primary/50 rounded-xl p-3 text-sm focus:outline-none min-h-[80px]"
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                autoFocus
                            />
                            <div className="flex justify-end gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setEditingId(null)} className="h-8 w-8 p-0">
                                    <X size={16} />
                                </Button>
                                <Button size="sm" onClick={() => saveEdit(note.id)} className="h-8 w-8 p-0 bg-primary text-primary-foreground">
                                    <Check size={16} />
                                </Button>
                            </div>
                        </div>
                     ) : (
                         <>
                            <p className="text-sm whitespace-pre-wrap pr-8">{note.text}</p>
                            <p className="text-[10px] text-muted-foreground mt-2 font-medium">
                                {new Date(note.date).toLocaleDateString()}
                            </p>
                            
                            <div className="absolute top-2 right-2 flex gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button 
                                    variant="ghost" 
                                    size="icon" 
                                    className="h-7 w-7 text-muted-foreground hover:text-primary"
                                    onClick={() => startEdit(note.id, note.text)}
                                >
                                    <Edit size={14} />
                                </Button>
                                
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                        >
                                            <Trash2 size={14} />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent className="max-w-[80vw] rounded-2xl">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>Delete Note?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                This action cannot be undone.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                                            <AlertDialogAction onClick={() => deleteNote(note.id)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">Delete</AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </div>
                         </>
                     )}
                 </div>
             ))}
        </div>
      </div>
    </Layout>
  );
}
