import { useEffect, useState } from "react";
import { useRoute, useLocation } from "wouter";
import { useApp, WorkoutExercise, WorkoutSet } from "@/lib/store";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Plus, Trash2, Check, Clock, Save, Camera, MoreVertical, X } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { format } from "date-fns";

export default function WorkoutPage() {
  const [match, params] = useRoute("/workout/:id");
  const [, setLocation] = useLocation();
  const { workouts, activeWorkoutId, updateWorkout, finishWorkout, deleteWorkout, getExerciseName, exercises, addExercise, unitSystem } = useApp();
  
  // If no ID provided, try to find active workout or redirect
  const workoutId = match ? params.id : activeWorkoutId;
  const workout = workouts.find(w => w.id === workoutId);

  const [elapsedTime, setElapsedTime] = useState(0);

  // Timer logic
  useEffect(() => {
    if (!workout || workout.endTime) return;
    
    const interval = setInterval(() => {
        const start = new Date(workout.startTime).getTime();
        const now = new Date().getTime();
        setElapsedTime(Math.floor((now - start) / 1000));
    }, 1000);
    
    return () => clearInterval(interval);
  }, [workout]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!workout) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center h-[80vh] px-4 text-center space-y-4">
            <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                <Clock size={32} />
            </div>
            <h2 className="text-xl font-bold">No Active Workout</h2>
            <p className="text-muted-foreground">Start a new workout from the home screen.</p>
            <Button onClick={() => setLocation("/")}>Go Home</Button>
        </div>
      </Layout>
    );
  }

  const isReadonly = !!workout.endTime;

  const handleFinish = () => {
    finishWorkout();
    setLocation("/");
  };

  const handleAddExercise = (exerciseId: string) => {
    const newExercise: WorkoutExercise = {
        id: crypto.randomUUID(),
        exerciseId,
        sets: [
            { id: crypto.randomUUID(), reps: 0, weight: 0, completed: false }
        ]
    };
    updateWorkout({
        ...workout,
        exercises: [...workout.exercises, newExercise]
    });
  };

  const handleUpdateSet = (exerciseId: string, setId: string, field: 'reps' | 'weight' | 'completed', value: any) => {
      if (isReadonly) return;
      const updatedExercises = workout.exercises.map(ex => {
          if (ex.id === exerciseId) {
              return {
                  ...ex,
                  sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
              };
          }
          return ex;
      });
      updateWorkout({ ...workout, exercises: updatedExercises });
  };

  const handleAddSet = (exerciseId: string, previousSet?: WorkoutSet) => {
      if (isReadonly) return;
      const updatedExercises = workout.exercises.map(ex => {
          if (ex.id === exerciseId) {
              const newSet: WorkoutSet = {
                  id: crypto.randomUUID(),
                  reps: previousSet ? previousSet.reps : 0,
                  weight: previousSet ? previousSet.weight : 0,
                  completed: false
              };
              return { ...ex, sets: [...ex.sets, newSet] };
          }
          return ex;
      });
      updateWorkout({ ...workout, exercises: updatedExercises });
  };
  
  const handleRemoveSet = (exerciseId: string, setId: string) => {
      if (isReadonly) return;
      const updatedExercises = workout.exercises.map(ex => {
          if (ex.id === exerciseId) {
              return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
          }
          return ex;
      });
      // If no sets left, remove exercise? No, let user delete exercise explicitly usually, but for simplicity let's keep empty exercise
      updateWorkout({ ...workout, exercises: updatedExercises });
  };

    const handleDeleteExercise = (exerciseId: string) => {
        if (isReadonly) return;
        updateWorkout({
            ...workout,
            exercises: workout.exercises.filter(e => e.id !== exerciseId)
        });
    };

    const handlePhotoUpload = () => {
        // Mock photo upload
        const mockUrl = "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80";
        updateWorkout({ ...workout, photoUrl: mockUrl });
    };

  return (
    <div className="flex flex-col h-screen bg-background text-foreground">
      {/* Header */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-10">
        <Button variant="ghost" size="icon" onClick={() => setLocation("/")} className="h-8 w-8 -ml-2">
            <ArrowLeft size={20} />
        </Button>
        <div className="flex flex-col items-center">
             <span className="font-bold text-sm">{workout.name}</span>
             <span className="text-xs font-mono text-primary font-medium">{isReadonly ? "Finished" : formatTime(elapsedTime)}</span>
        </div>
        {!isReadonly ? (
             <Button size="sm" onClick={handleFinish} className="h-8 rounded-full px-4 text-xs font-bold">
                Finish
            </Button>
        ) : (
            <div className="w-8" />
        )}
       
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6 pb-24">
        {/* Photo Area */}
        {workout.photoUrl ? (
             <div className="relative rounded-2xl overflow-hidden aspect-video border border-border group">
                <img src={workout.photoUrl} alt="Workout" className="w-full h-full object-cover" />
                {!isReadonly && (
                    <Button 
                        size="icon" 
                        variant="destructive" 
                        className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => updateWorkout({...workout, photoUrl: undefined})}
                    >
                        <Trash2 size={14} />
                    </Button>
                )}
             </div>
        ) : (
             !isReadonly && (
                 <div onClick={handlePhotoUpload} className="border-2 border-dashed border-border rounded-2xl p-4 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-secondary/50 hover:border-primary/50 cursor-pointer transition-colors h-24">
                    <Camera size={24} />
                    <span className="text-xs font-medium">Add Workout Photo</span>
                 </div>
             )
        )}

        {/* Exercises List */}
        <div className="space-y-4">
            {workout.exercises.map((exercise, index) => (
                <ExerciseCard 
                    key={exercise.id} 
                    exercise={exercise} 
                    name={getExerciseName(exercise.exerciseId)}
                    onUpdateSet={handleUpdateSet}
                    onAddSet={handleAddSet}
                    onRemoveSet={handleRemoveSet}
                    onDelete={() => handleDeleteExercise(exercise.id)}
                    isReadonly={isReadonly}
                    unitSystem={unitSystem}
                />
            ))}
        </div>

        {!isReadonly && (
             <AddExerciseDrawer onSelect={handleAddExercise} exercises={exercises} onNewExercise={addExercise} />
        )}
        
        {/* Workout Notes */}
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground pl-1">Workout Notes</label>
            <textarea 
                className="w-full bg-card border border-border rounded-xl p-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary min-h-[80px] resize-none"
                placeholder="How did it feel?"
                value={workout.notes || ""}
                onChange={(e) => updateWorkout({...workout, notes: e.target.value})}
                readOnly={isReadonly}
            />
        </div>
        
        {isReadonly && (
            <div className="pt-4 flex justify-center">
                 <Button variant="destructive" onClick={() => { deleteWorkout(workout.id); setLocation("/"); }}>
                    Delete Workout
                 </Button>
            </div>
        )}
      </div>
    </div>
  );
}

function ExerciseCard({ 
    exercise, 
    name, 
    onUpdateSet, 
    onAddSet, 
    onRemoveSet,
    onDelete,
    isReadonly,
    unitSystem
}: { 
    exercise: WorkoutExercise, 
    name: string, 
    onUpdateSet: (exId: string, setId: string, field: any, val: any) => void,
    onAddSet: (exId: string, prev?: WorkoutSet) => void,
    onRemoveSet: (exId: string, setId: string) => void,
    onDelete: () => void,
    isReadonly: boolean,
    unitSystem: string
}) {
    return (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
            <div className="p-3 border-b border-border flex justify-between items-center bg-secondary/30">
                <h3 className="font-bold text-foreground">{name}</h3>
                {!isReadonly && (
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-muted-foreground hover:text-destructive" onClick={onDelete}>
                        <X size={14} />
                    </Button>
                )}
            </div>
            <div className="p-2">
                <div className="grid grid-cols-10 gap-2 mb-2 px-2 text-[10px] font-bold text-muted-foreground uppercase tracking-wider text-center">
                    <div className="col-span-1">Set</div>
                    <div className="col-span-3">{unitSystem}</div>
                    <div className="col-span-3">Reps</div>
                    <div className="col-span-3">Done</div>
                </div>
                
                <div className="space-y-2">
                    {exercise.sets.map((set, idx) => (
                        <div key={set.id} className={cn("grid grid-cols-10 gap-2 items-center", set.completed && "opacity-50 transition-opacity")}>
                            <div className="col-span-1 flex justify-center">
                                <div className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center text-xs font-mono font-medium text-muted-foreground">
                                    {idx + 1}
                                </div>
                            </div>
                            <div className="col-span-3">
                                <Input 
                                    type="number" 
                                    className="h-9 text-center font-mono text-sm bg-background/50 border-transparent hover:border-border focus:border-primary px-1"
                                    value={set.weight || ""} 
                                    placeholder="0"
                                    onChange={(e) => onUpdateSet(exercise.id, set.id, 'weight', parseFloat(e.target.value) || 0)}
                                    readOnly={isReadonly}
                                />
                            </div>
                            <div className="col-span-3">
                                 <Input 
                                    type="number" 
                                    className="h-9 text-center font-mono text-sm bg-background/50 border-transparent hover:border-border focus:border-primary px-1"
                                    value={set.reps || ""} 
                                    placeholder="0"
                                    onChange={(e) => onUpdateSet(exercise.id, set.id, 'reps', parseFloat(e.target.value) || 0)}
                                    readOnly={isReadonly}
                                />
                            </div>
                            <div className="col-span-3 flex justify-center">
                                <Button
                                    size="sm"
                                    variant={set.completed ? "default" : "secondary"}
                                    className={cn("h-8 w-full rounded-lg transition-all", set.completed ? "bg-primary text-primary-foreground" : "bg-secondary hover:bg-secondary/80")}
                                    onClick={() => onUpdateSet(exercise.id, set.id, 'completed', !set.completed)}
                                    disabled={isReadonly}
                                >
                                    {set.completed ? <Check size={14} /> : <span className="text-[10px] font-bold">LOG</span>}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {!isReadonly && (
                    <Button 
                        variant="ghost" 
                        className="w-full mt-3 h-8 text-xs font-medium text-primary hover:text-primary hover:bg-primary/5 border border-dashed border-primary/20 hover:border-primary/50 rounded-xl"
                        onClick={() => onAddSet(exercise.id, exercise.sets[exercise.sets.length - 1])}
                    >
                        <Plus size={12} className="mr-1" /> Add Set
                    </Button>
                )}
            </div>
        </div>
    );
}

function AddExerciseDrawer({ onSelect, exercises, onNewExercise }: { onSelect: (id: string) => void, exercises: any[], onNewExercise: (ex: any) => void }) {
    const [search, setSearch] = useState("");
    const [isCustom, setIsCustom] = useState(false);
    
    const filtered = exercises.filter(e => e.name.toLowerCase().includes(search.toLowerCase()));

    const handleCreateCustom = () => {
        const newEx = {
            id: crypto.randomUUID(),
            name: search,
            muscleGroup: "Custom",
            custom: true
        };
        onNewExercise(newEx);
        onSelect(newEx.id);
        setSearch("");
    };

    return (
        <Drawer>
            <DrawerTrigger asChild>
                <Button className="w-full rounded-2xl h-12 text-sm font-semibold shadow-sm" variant="secondary">
                    <Plus size={18} className="mr-2" /> Add Exercise
                </Button>
            </DrawerTrigger>
            <DrawerContent className="max-h-[90vh] bg-card border-t border-border">
                <div className="mx-auto w-full max-w-sm">
                    <DrawerHeader>
                        <DrawerTitle>Select Exercise</DrawerTitle>
                        <DrawerDescription>Choose from the list or create custom.</DrawerDescription>
                    </DrawerHeader>
                    <div className="p-4 space-y-4">
                        <Input 
                            placeholder="Search exercise..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="bg-secondary/50 border-transparent focus:border-primary"
                        />
                        <div className="h-[300px] overflow-y-auto space-y-2 pr-2">
                            {filtered.map(ex => (
                                <div 
                                    key={ex.id} 
                                    onClick={() => onSelect(ex.id)}
                                    className="p-3 rounded-xl bg-secondary/30 hover:bg-secondary cursor-pointer flex justify-between items-center transition-colors border border-transparent hover:border-primary/20"
                                >
                                    <span className="font-medium">{ex.name}</span>
                                    <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded-md">{ex.muscleGroup}</span>
                                </div>
                            ))}
                            {filtered.length === 0 && search && (
                                <Button className="w-full" onClick={handleCreateCustom}>
                                    Create "{search}"
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            </DrawerContent>
        </Drawer>
    )
}
