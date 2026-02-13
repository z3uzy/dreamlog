import { Layout } from "@/components/Layout";
import { useApp } from "@/lib/store";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useState, useMemo } from "react";
import { format, isAfter, subDays, subMonths, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function Progress() {
  const { workouts, exercises, unitSystem } = useApp();
  const [selectedExerciseId, setSelectedExerciseId] = useState<string>(exercises[0]?.id || "");
  const [metric, setMetric] = useState<"maxWeight" | "volume">("maxWeight");
  const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("all");

  const chartData = useMemo(() => {
    if (!selectedExerciseId) return [];

    // Filter workouts containing the exercise
    // We include active workouts too if they have data? User usually expects completed. 
    // "No data for this period" was the bug.
    // Let's look at all workouts that have the exercise and at least one completed set.
    const relevantWorkouts = workouts
      .filter(w => {
          const hasExercise = w.exercises.some(e => e.exerciseId === selectedExerciseId);
          // Only show if it has started (date exists)
          return hasExercise && w.date;
      })
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Filter by time range
    const now = new Date();
    const filteredWorkouts = relevantWorkouts.filter(w => {
        const d = new Date(w.date);
        if (timeRange === "week") return isAfter(d, subDays(now, 7));
        if (timeRange === "month") return isAfter(d, subMonths(now, 30));
        return true;
    });

    const dataPoints = filteredWorkouts.map(w => {
      const ex = w.exercises.find(e => e.exerciseId === selectedExerciseId);
      if (!ex) return null;

      // Filter for valid sets (weight > 0 for max weight, or just existence)
      // If no sets are logged, don't show 0? Or show 0?
      // "Max weight per workout" implies logged sets.
      const validSets = ex.sets.filter(s => s.completed || (s.weight > 0 && s.reps > 0)); // Include sets that have data even if not marked 'completed' strictly? Better to stick to completed or just non-zero.
      
      if (validSets.length === 0) return null;

      let value = 0;
      if (metric === "maxWeight") {
        value = Math.max(...validSets.map(s => s.weight));
      } else {
        value = validSets.reduce((acc, s) => acc + (s.weight * s.reps), 0);
      }

      if (value === 0) return null;

      return {
        date: format(new Date(w.date), "MMM d"),
        value: value,
        fullDate: w.date
      };
    }).filter((item): item is { date: string, value: number, fullDate: string } => item !== null);

    return dataPoints;

  }, [workouts, selectedExerciseId, metric, timeRange]);

  return (
    <Layout>
      <div className="p-4 space-y-6 max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
        <h1 className="text-2xl font-bold font-heading">Progress</h1>

        <div className="space-y-4">
            {/* Controls */}
            <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Exercise</label>
                <Select value={selectedExerciseId} onValueChange={setSelectedExerciseId}>
                    <SelectTrigger className="w-full bg-card border-border h-12 rounded-xl">
                        <SelectValue placeholder="Select Exercise" />
                    </SelectTrigger>
                    <SelectContent>
                        {exercises.map(e => (
                            <SelectItem key={e.id} value={e.id}>{e.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground uppercase">Metric</label>
                     <div className="flex bg-secondary/50 p-1 rounded-xl">
                        <button 
                            className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${metric === 'maxWeight' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
                            onClick={() => setMetric("maxWeight")}
                        >
                            Max Weight
                        </button>
                        <button 
                            className={`flex-1 text-xs font-medium py-2 rounded-lg transition-all ${metric === 'volume' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}
                             onClick={() => setMetric("volume")}
                        >
                            Volume
                        </button>
                     </div>
                </div>
                 <div className="space-y-2">
                     <label className="text-xs font-bold text-muted-foreground uppercase">Range</label>
                     <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
                        <SelectTrigger className="w-full bg-card border-border h-[42px] rounded-xl text-xs">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="week">1 Week</SelectItem>
                            <SelectItem value="month">1 Month</SelectItem>
                            <SelectItem value="all">All Time</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            {/* Chart */}
            <Card className="border-border bg-card shadow-sm overflow-hidden rounded-2xl">
                <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        {metric === "maxWeight" ? `Max Weight (${unitSystem})` : `Volume (${unitSystem} x Reps)`}
                    </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] w-full p-0">
                    {chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                            <XAxis 
                                dataKey="date" 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                                dy={10}
                            />
                            <YAxis 
                                axisLine={false} 
                                tickLine={false} 
                                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }} 
                                dx={-10}
                                domain={['auto', 'auto']}
                            />
                            <Tooltip 
                                contentStyle={{ backgroundColor: "hsl(var(--popover))", borderRadius: "8px", border: "1px solid hsl(var(--border))", color: "hsl(var(--popover-foreground))" }}
                                itemStyle={{ color: "hsl(var(--primary))" }}
                                cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "4 4" }}
                            />
                            <Line 
                                type="monotone" 
                                dataKey="value" 
                                stroke="hsl(var(--primary))" 
                                strokeWidth={3}
                                dot={{ fill: "hsl(var(--background))", stroke: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                                activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                            />
                        </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm">
                            No data for this period
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Stats Summary */}
            <div className="grid grid-cols-2 gap-4">
                 <div className="bg-secondary/20 p-4 rounded-2xl border border-border">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Personal Record</p>
                    <p className="text-2xl font-mono font-bold text-primary">
                        {Math.max(...chartData.map(d => d.value), 0)} <span className="text-sm">{metric === 'maxWeight' ? unitSystem : 'vol'}</span>
                    </p>
                 </div>
                 <div className="bg-secondary/20 p-4 rounded-2xl border border-border">
                    <p className="text-xs text-muted-foreground font-bold uppercase mb-1">Sessions</p>
                    <p className="text-2xl font-mono font-bold text-foreground">
                        {chartData.length}
                    </p>
                 </div>
            </div>
        </div>
      </div>
    </Layout>
  );
}
