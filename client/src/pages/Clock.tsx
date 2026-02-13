import { Layout } from "@/components/Layout";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export default function Clock() {
  const { timer, startTimer, pauseTimer, resetTimer, setTimerType } = useApp();
  const [displayTime, setDisplayTime] = useState(0);

  useEffect(() => {
    // Immediate update on mount
    updateDisplay();

    const interval = setInterval(updateDisplay, 100);
    return () => clearInterval(interval);
  }, [timer]);

  const updateDisplay = () => {
    if (!timer.startTime) {
      if (timer.pausedAt && timer.type === 'stopwatch') {
          setDisplayTime(timer.pausedAt - (timer.startTime || timer.pausedAt)); // Wait, if startTime is null, display should be 0 or held value?
          // If reset, startTime is null. If paused, we need to track elapsed. 
          // My store logic for pause sets pausedAt but keeps startTime null? No, store logic:
          // pause: isRunning: false, pausedAt: now. startTime is preserved?
          // Let's check store logic: resetTimer sets startTime: null.
      } else if (timer.type === 'rest') {
          setDisplayTime(timer.duration);
      } else {
          setDisplayTime(0);
      }
      return;
    }

    const now = timer.pausedAt || Date.now();
    const elapsed = now - timer.startTime;

    if (timer.type === 'stopwatch') {
      setDisplayTime(elapsed);
    } else {
      const remaining = Math.max(0, timer.duration - elapsed);
      setDisplayTime(remaining);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.ceil(ms / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  const formatStopwatch = (ms: number) => {
      const totalSeconds = Math.floor(ms / 1000);
      const mins = Math.floor(totalSeconds / 60);
      const secs = totalSeconds % 60;
      const centis = Math.floor((ms % 1000) / 10);
      return `${mins}:${secs.toString().padStart(2, '0')}.${centis.toString().padStart(2, '0')}`;
  }

  const PRESETS = [30, 60, 90, 120];

  return (
    <Layout>
      <div className="p-4 space-y-6 max-w-md mx-auto animate-in fade-in duration-500 h-full flex flex-col">
        <h1 className="text-2xl font-bold font-heading">Clock</h1>

        <Tabs 
            defaultValue={timer.type} 
            value={timer.type} 
            onValueChange={(v) => {
                setTimerType(v as 'rest' | 'stopwatch');
            }}
            className="w-full flex-1 flex flex-col"
        >
          <TabsList className="grid w-full grid-cols-2 bg-secondary/50 p-1 rounded-xl mb-8">
            <TabsTrigger value="rest" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Rest Timer</TabsTrigger>
            <TabsTrigger value="stopwatch" className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">Stopwatch</TabsTrigger>
          </TabsList>

          <div className="flex-1 flex flex-col items-center justify-center space-y-12">
            {/* Time Display */}
            <div className="relative">
                <div className="text-8xl font-mono font-bold tracking-tighter tabular-nums text-foreground">
                    {timer.type === 'rest' ? formatTime(displayTime) : formatStopwatch(displayTime)}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6">
                 {timer.isRunning ? (
                    <Button 
                        size="icon" 
                        className="h-20 w-20 rounded-full bg-secondary hover:bg-secondary/80 text-foreground border-2 border-transparent"
                        onClick={() => pauseTimer()}
                    >
                        <Pause size={32} fill="currentColor" />
                    </Button>
                 ) : (
                    <Button 
                        size="icon" 
                        className="h-20 w-20 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                        onClick={() => startTimer()}
                    >
                        <Play size={32} fill="currentColor" className="ml-1" />
                    </Button>
                 )}

                 <Button 
                    size="icon" 
                    variant="ghost"
                    className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => resetTimer()}
                 >
                    <RotateCcw size={20} />
                 </Button>
            </div>

            {/* Rest Presets */}
            {timer.type === 'rest' && (
                <div className="grid grid-cols-4 gap-3 w-full px-2">
                    {PRESETS.map(seconds => (
                        <Button
                            key={seconds}
                            variant="outline"
                            className={cn(
                                "h-12 rounded-xl border-border bg-card hover:bg-secondary hover:border-primary/50 transition-all",
                                timer.duration === seconds * 1000 && "border-primary text-primary bg-primary/5"
                            )}
                            onClick={() => {
                                resetTimer();
                                startTimer(seconds * 1000);
                            }}
                        >
                            {seconds}s
                        </Button>
                    ))}
                </div>
            )}
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
