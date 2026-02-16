import { Layout } from "@/components/Layout";
import { useApp } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, Plus, Trash2, Save, Pencil } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";

export default function Clock() {
  const { timer, timerPresets, startTimer, pauseTimer, resetTimer, setTimerType, saveTimerPreset, updateTimerPreset, deleteTimerPreset } = useApp();
  const [displayTime, setDisplayTime] = useState(0);
  const [customMinutes, setCustomMinutes] = useState("");
  const [customSeconds, setCustomSeconds] = useState("");
  const [isCustomDialogOpen, setIsCustomDialogOpen] = useState(false);
  
  // Edit Preset State
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [editMinutes, setEditMinutes] = useState("");
  const [editSeconds, setEditSeconds] = useState("");

  const [hasPlayedSound, setHasPlayedSound] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    // Mobile Audio Unlock on first interaction
    const unlockAudio = () => {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
            if (!audioContextRef.current) {
                audioContextRef.current = new AudioContext();
            }
            // Resume if suspended (common on mobile)
            if (audioContextRef.current.state === 'suspended') {
                audioContextRef.current.resume();
            }
            // Play silent buffer to unlock
            const buffer = audioContextRef.current.createBuffer(1, 1, 22050);
            const source = audioContextRef.current.createBufferSource();
            source.buffer = buffer;
            source.connect(audioContextRef.current.destination);
            source.start(0);
        }
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('click', unlockAudio);
    };

    window.addEventListener('touchstart', unlockAudio);
    window.addEventListener('click', unlockAudio);

    return () => {
        window.removeEventListener('touchstart', unlockAudio);
        window.removeEventListener('click', unlockAudio);
    };
  }, []);

  useEffect(() => {
    // Immediate update on mount
    updateDisplay();

    const interval = setInterval(updateDisplay, 100);
    return () => clearInterval(interval);
  }, [timer]);

  const playBeep = () => {
    try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioContext) return;
        
        // Use existing context if available, otherwise create new
        if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext();
        }
        const ctx = audioContextRef.current;
        
        // Ensure running
        if (ctx.state === 'suspended') {
            ctx.resume();
        }

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        // Beep Sound: High pitch short beep
        osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
        osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.1);
        osc.type = "sine";
        
        gain.gain.setValueAtTime(0.5, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
        
        osc.start();
        osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
        console.error("Audio play failed", e);
    }
  };

  const updateDisplay = () => {
    if (!timer.startTime) {
      if (timer.pausedAt && timer.type === 'stopwatch') {
          setDisplayTime(timer.pausedAt - (timer.startTime || timer.pausedAt)); 
      } else if (timer.type === 'rest') {
          setDisplayTime(timer.duration);
          setHasPlayedSound(false);
      } else {
          setDisplayTime(0);
          setHasPlayedSound(false);
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
      
      if (remaining === 0 && !hasPlayedSound && timer.isRunning) {
          playBeep();
          setHasPlayedSound(true);
      }
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

  const handleStartCustom = () => {
      const mins = parseInt(customMinutes) || 0;
      const secs = parseInt(customSeconds) || 0;
      if (mins === 0 && secs === 0) return;
      
      const duration = (mins * 60 + secs) * 1000;
      resetTimer();
      startTimer(duration);
      setIsCustomDialogOpen(false);
  };

  const handleSaveCustom = () => {
      const mins = parseInt(customMinutes) || 0;
      const secs = parseInt(customSeconds) || 0;
      if (mins === 0 && secs === 0) return;
      
      const duration = (mins * 60 + secs) * 1000;
      
      // Smart label
      let label = "";
      if (mins > 0) label += `${mins}m`;
      if (secs > 0) label += `${secs}s`;
      
      saveTimerPreset(duration, label);
      handleStartCustom();
  };

  const openEditDialog = (preset: any) => {
      setEditingPresetId(preset.id);
      const totalSecs = Math.ceil(preset.duration / 1000);
      setEditMinutes(Math.floor(totalSecs / 60).toString());
      setEditSeconds((totalSecs % 60).toString());
      setIsEditDialogOpen(true);
  };

  const handleUpdatePreset = () => {
      if (!editingPresetId) return;
      const mins = parseInt(editMinutes) || 0;
      const secs = parseInt(editSeconds) || 0;
      if (mins === 0 && secs === 0) return;

      const duration = (mins * 60 + secs) * 1000;
      let label = "";
      if (mins > 0) label += `${mins}m`;
      if (secs > 0) label += `${secs}s`;

      updateTimerPreset(editingPresetId, duration, label);
      setIsEditDialogOpen(false);
      setEditingPresetId(null);
  };

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
            <div className="flex flex-col items-center gap-8 w-full max-w-[200px]">
                 <div className="flex items-center justify-center">
                     {timer.isRunning ? (
                        <Button 
                            size="icon" 
                            className="h-24 w-24 rounded-full bg-secondary hover:bg-secondary/80 text-foreground border-2 border-transparent"
                            onClick={() => pauseTimer()}
                        >
                            <Pause size={32} fill="currentColor" />
                        </Button>
                     ) : (
                        <Button 
                            size="icon" 
                            className="h-24 w-24 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                            onClick={() => startTimer()}
                        >
                            <Play size={32} fill="currentColor" className="ml-1" />
                        </Button>
                     )}
                 </div>

                 <Button 
                    size="icon" 
                    variant="ghost"
                    className="h-12 w-12 rounded-full text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                    onClick={() => { resetTimer(); setHasPlayedSound(false); }}
                 >
                    <RotateCcw size={24} />
                 </Button>
            </div>

            {/* Rest Presets */}
            {timer.type === 'rest' && (
                <div className="w-full space-y-3">
                    <div className="grid grid-cols-4 gap-3 w-full px-2">
                        {timerPresets.map(preset => (
                            <div key={preset.id} className="relative group">
                                <Button
                                    variant="outline"
                                    className={cn(
                                        "w-full h-12 rounded-xl border-border bg-card hover:bg-secondary hover:border-primary/50 transition-all text-xs font-bold",
                                        timer.duration === preset.duration && "border-primary text-primary bg-primary/5"
                                    )}
                                    onClick={() => {
                                        resetTimer();
                                        startTimer(preset.duration);
                                    }}
                                >
                                    {preset.label}
                                </Button>
                                <div className="absolute -top-2 -right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <div 
                                        className="bg-primary text-primary-foreground rounded-full p-1 cursor-pointer shadow-sm"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            openEditDialog(preset);
                                        }}
                                    >
                                       <Pencil size={10} />
                                    </div>
                                    <div 
                                        className="bg-destructive text-destructive-foreground rounded-full p-1 cursor-pointer shadow-sm"
                                        onClick={(e) => { e.stopPropagation(); deleteTimerPreset(preset.id); }}
                                    >
                                        <Trash2 size={10} />
                                    </div>
                                </div>
                            </div>
                        ))}
                        
                        <Dialog open={isCustomDialogOpen} onOpenChange={setIsCustomDialogOpen}>
                            <DialogTrigger asChild>
                                <Button
                                    variant="secondary"
                                    className="h-12 rounded-xl border border-dashed border-border bg-transparent hover:bg-secondary/50"
                                >
                                    <Plus size={18} />
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-xs rounded-2xl bg-card border-border">
                                <DialogHeader>
                                    <DialogTitle>Custom Timer</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase text-center block">Min</label>
                                        <Input 
                                            type="number" 
                                            className="text-center text-2xl h-14 font-mono" 
                                            placeholder="00" 
                                            value={customMinutes}
                                            onChange={(e) => setCustomMinutes(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase text-center block">Sec</label>
                                        <Input 
                                            type="number" 
                                            className="text-center text-2xl h-14 font-mono" 
                                            placeholder="00" 
                                            value={customSeconds}
                                            onChange={(e) => setCustomSeconds(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button className="flex-1" variant="outline" onClick={handleSaveCustom}>
                                        <Save size={16} className="mr-2" /> Save & Start
                                    </Button>
                                    <Button className="flex-1" onClick={handleStartCustom}>
                                        <Play size={16} className="mr-2" /> Start Only
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        {/* Edit Dialog */}
                        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                            <DialogContent className="sm:max-w-xs rounded-2xl bg-card border-border">
                                <DialogHeader>
                                    <DialogTitle>Edit Timer</DialogTitle>
                                </DialogHeader>
                                <div className="grid grid-cols-2 gap-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase text-center block">Min</label>
                                        <Input 
                                            type="number" 
                                            className="text-center text-2xl h-14 font-mono" 
                                            placeholder="00" 
                                            value={editMinutes}
                                            onChange={(e) => setEditMinutes(e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-muted-foreground uppercase text-center block">Sec</label>
                                        <Input 
                                            type="number" 
                                            className="text-center text-2xl h-14 font-mono" 
                                            placeholder="00" 
                                            value={editSeconds}
                                            onChange={(e) => setEditSeconds(e.target.value)}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleUpdatePreset} className="w-full">
                                        Update Preset
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>
            )}
          </div>
        </Tabs>
      </div>
    </Layout>
  );
}
