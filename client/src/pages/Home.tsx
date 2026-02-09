import { useApp } from "@/lib/store";
import { format, isToday, isYesterday } from "date-fns";
import { Link, useLocation } from "wouter";
import { Plus, ChevronRight, Play, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Layout } from "@/components/Layout";

export default function Home() {
  const { workouts, startWorkout, activeWorkoutId, exercises } = useApp();
  const [, setLocation] = useLocation();

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

  const todaysWorkouts = workouts.filter(w => isToday(new Date(w.date)));
  const recentWorkouts = workouts.filter(w => !isToday(new Date(w.date)) && w.endTime).slice(0, 5);

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
            <h1 className="text-2xl font-bold font-heading text-foreground">IronLog</h1>
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
            {todaysWorkouts.length > 0 && (
                <div className="space-y-2">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Today</p>
                    {todaysWorkouts.map(workout => (
                        <WorkoutCard key={workout.id} workout={workout} summary={getExerciseSummary(workout)} />
                    ))}
                </div>
            )}

            <div className="space-y-2">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Previous</p>
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
