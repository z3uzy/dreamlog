import { useApp, Workout } from "@/lib/store";
import { format, isToday, isYesterday, formatDistanceToNow } from "date-fns";
import { Link, useLocation } from "wouter";
import { Plus, ChevronRight, Play, Calendar, Dumbbell, Clock, Trophy, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";

export default function Home() {
  const { workouts, startWorkout, activeWorkoutId, exercises, unitSystem } = useApp();
  const [, setLocation] = useLocation();

  const lastCompletedWorkout = workouts
    .filter(w => w.endTime && w.status === "finished")
    .sort((a, b) => new Date(b.endTime!).getTime() - new Date(a.endTime!).getTime())[0] || null;

  const handleStartWorkout = (template?: string) => {
    if (activeWorkoutId) {
      setLocation(`/workout/${activeWorkoutId}`);
    } else {
      startWorkout(template);
      // We need to wait for state update in a real app or use a ref, 
      // but here we know the next ID will be at the top of the list in the next render.
      // For this mock, we'll let the user click "Resume" or navigate manually if it fails to redirect immediately,
      // but let's try to redirect to the generic workout page which handles the active ID
      setTimeout(() => setLocation("/workout"), 50); 
    }
  };

  const recentWorkouts = [...workouts]
    .filter(w => w.status === "finished")
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  const getExerciseSummary = (workout: any) => {
     const count = workout.exercises.length;
     if (count === 0) return "No exercises";
     const names = workout.exercises.slice(0, 2).map((we: any) => {
        const ex = exercises.find(e => e.id === we.exerciseId);
        return ex ? ex.name : "Unknown";
     }).join(", ");
     return count > 2 ? `${names} +${count - 2} more` : names;
  };

  return (
    <Layout>
      <div className="p-4 space-y-6 max-w-md mx-auto animate-in fade-in duration-500">
        <header className="flex justify-between items-center py-2">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">DreamLog</h1>
            <p className="text-sm text-muted-foreground">{format(new Date(), "EEEE, MMMM do")}</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-primary border border-border">
            {workouts.filter(w => w.endTime).length}
          </div>
        </header>

        {/* Active Workout Banner */}
        {activeWorkoutId && (
          <div className="bg-primary/10 border border-primary/20 rounded-2xl p-4 flex justify-between items-center" onClick={() => setLocation(`/workout/${activeWorkoutId}`)}>
             <div>
                <h3 className="font-bold text-primary">Workout in Progress</h3>
                <p className="text-xs text-primary/80">Tap to resume tracking</p>
             </div>
             <Button size="sm" className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">Resume</Button>
          </div>
        )}

        {/* Last Workout Summary */}
        {lastCompletedWorkout && !activeWorkoutId && (
          <LastWorkoutSummary 
            workout={lastCompletedWorkout} 
            exercises={exercises} 
            unitSystem={unitSystem}
            onClick={() => setLocation(`/workout/${lastCompletedWorkout.id}`)}
          />
        )}

        {/* Quick Start */}
        <section className="space-y-3">
          <h2 className="text-lg font-semibold font-heading">Start Workout</h2>
          <div className="grid grid-cols-2 gap-3">
            <Button 
              className="h-24 rounded-2xl flex flex-col gap-2 bg-card hover:bg-secondary/50 border border-border text-foreground transition-all duration-300 hover:scale-[1.02] shadow-sm"
              onClick={() => handleStartWorkout("Empty Workout")}
            >
              <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                <Plus size={18} />
              </div>
              <span className="font-semibold">Empty</span>
            </Button>
            <Button 
              className="h-24 rounded-2xl flex flex-col gap-2 bg-card hover:bg-secondary/50 border border-border text-foreground transition-all duration-300 hover:scale-[1.02] shadow-sm"
               onClick={() => handleStartWorkout("Push Day")}
            >
              <div className="h-8 w-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-500">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
              </div>
              <span className="font-semibold">Push A</span>
            </Button>
            <Button 
              className="h-24 rounded-2xl flex flex-col gap-2 bg-card hover:bg-secondary/50 border border-border text-foreground transition-all duration-300 hover:scale-[1.02] shadow-sm"
              onClick={() => handleStartWorkout("Pull Day")}
            >
               <div className="h-8 w-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-500">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
              </div>
              <span className="font-semibold">Pull A</span>
            </Button>
             <Button 
              className="h-24 rounded-2xl flex flex-col gap-2 bg-card hover:bg-secondary/50 border border-border text-foreground transition-all duration-300 hover:scale-[1.02] shadow-sm"
              onClick={() => handleStartWorkout("Leg Day")}
            >
               <div className="h-8 w-8 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-500">
                <div className="w-2 h-2 rounded-full bg-purple-500" />
              </div>
              <span className="font-semibold">Legs A</span>
            </Button>
          </div>
        </section>

        {/* Recent History */}
        <section className="space-y-3">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold font-heading">Recent Activity</h2>
            <Link href="/progress">
              <span className="text-xs text-primary font-medium cursor-pointer">View Stats</span>
            </Link>
          </div>
          
          <div className="space-y-3">
            <div className="space-y-2">
                {recentWorkouts.map(workout => (
                    <WorkoutCard key={workout.id} workout={workout} summary={getExerciseSummary(workout)} />
                ))}
                {recentWorkouts.length === 0 && <p className="text-sm text-muted-foreground">No recent workouts.</p>}
            </div>
          </div>
        </section>
      </div>
    </Layout>
  );
}

function LastWorkoutSummary({ workout, exercises: allExercises, unitSystem, onClick }: { 
  workout: Workout, 
  exercises: { id: string; name: string; muscleGroup: string }[], 
  unitSystem: string,
  onClick: () => void 
}) {
  const totalSets = workout.exercises.reduce((acc, ex) => acc + ex.sets.filter(s => s.completed).length, 0);
  const totalVolume = workout.exercises.reduce((acc, ex) => 
    acc + ex.sets.filter(s => s.completed).reduce((sum, s) => sum + (s.weight * s.reps), 0), 0
  );
  const exerciseNames = workout.exercises.slice(0, 3).map(we => {
    const ex = allExercises.find(e => e.id === we.exerciseId);
    return ex ? ex.name : "Unknown";
  });

  const duration = workout.endTime && workout.startTime
    ? Math.round((new Date(workout.endTime).getTime() - new Date(workout.startTime).getTime()) / 60000)
    : 0;

  const timeAgo = workout.endTime 
    ? formatDistanceToNow(new Date(workout.endTime), { addSuffix: true })
    : "";

  return (
    <div 
      data-testid="card-last-workout"
      onClick={onClick}
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-card border border-primary/20 p-4 cursor-pointer transition-all duration-300 hover:border-primary/40 hover:shadow-lg group"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center">
            <Trophy size={14} className="text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-primary/70">Last Workout</p>
            <h3 className="font-bold text-foreground text-sm leading-tight">{workout.name}</h3>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-muted-foreground">{timeAgo}</p>
          <ChevronRight size={14} className="text-muted-foreground group-hover:text-primary transition-colors ml-auto" />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-background/50 rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Dumbbell size={12} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-bold font-mono text-foreground">{workout.exercises.length}</p>
          <p className="text-[10px] text-muted-foreground">Exercises</p>
        </div>
        <div className="bg-background/50 rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Trophy size={12} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-bold font-mono text-foreground">{totalSets}</p>
          <p className="text-[10px] text-muted-foreground">Sets</p>
        </div>
        <div className="bg-background/50 rounded-xl p-2.5 text-center">
          <div className="flex items-center justify-center gap-1 mb-1">
            <Clock size={12} className="text-muted-foreground" />
          </div>
          <p className="text-sm font-bold font-mono text-foreground">{duration}m</p>
          <p className="text-[10px] text-muted-foreground">Duration</p>
        </div>
      </div>

      {totalVolume > 0 && (
        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium">Total Volume:</span>
          <span className="font-bold font-mono text-foreground">{totalVolume.toLocaleString()} {unitSystem}</span>
        </div>
      )}

      <div className="mt-2 flex flex-wrap gap-1.5">
        {exerciseNames.map((name, i) => (
          <span key={i} className="text-[10px] bg-secondary/50 text-muted-foreground px-2 py-0.5 rounded-full">{name}</span>
        ))}
        {workout.exercises.length > 3 && (
          <span className="text-[10px] text-primary/70 px-1 py-0.5">+{workout.exercises.length - 3} more</span>
        )}
      </div>
    </div>
  );
}

function WorkoutCard({ workout, summary }: { workout: any, summary: string }) {
    const [, setLocation] = useLocation();
    
    return (
        <div 
            onClick={() => setLocation(`/workout/${workout.id}`)}
            className="group flex flex-col gap-2 p-4 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md"
        >
            <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-foreground">
                        <Calendar size={18} />
                    </div>
                    <div>
                        <h4 className="font-semibold text-foreground group-hover:text-primary transition-colors">{workout.name}</h4>
                        <p className="text-xs text-muted-foreground">{format(new Date(workout.date), "h:mm a")} • {workout.exercises.length} Exercises</p>
                    </div>
                </div>
                <ChevronRight size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <div className="pl-[52px]">
                 <p className="text-xs text-muted-foreground line-clamp-1">{summary}</p>
            </div>
        </div>
    )
}
