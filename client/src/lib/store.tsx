import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { format } from "date-fns";

// Types
export type UnitSystem = "kg" | "lb";

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  custom?: boolean;
}

export interface WorkoutSet {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface WorkoutExercise {
  id: string;
  exerciseId: string;
  sets: WorkoutSet[];
  notes?: string;
}

export interface Workout {
  id: string;
  name: string;
  date: string; // ISO string
  exercises: WorkoutExercise[];
  notes?: string;
  photoUrl?: string;
  startTime: string;
  endTime?: string;
}

export interface Note {
  id: string;
  text: string;
  date: string;
}

export interface TimerState {
    type: 'stopwatch' | 'rest';
    startTime: number | null; // Timestamp when started
    duration: number; // For rest timer (ms)
    pausedAt: number | null; // Timestamp when paused
    isRunning: boolean;
}

// Initial Mock Data
const DEFAULT_EXERCISES: Exercise[] = [
  { id: "e1", name: "Bench Press", muscleGroup: "Chest" },
  { id: "e2", name: "Squat", muscleGroup: "Legs" },
  { id: "e3", name: "Deadlift", muscleGroup: "Back" },
  { id: "e4", name: "Overhead Press", muscleGroup: "Shoulders" },
  { id: "e5", name: "Pull Up", muscleGroup: "Back" },
  { id: "e6", name: "Dumbbell Row", muscleGroup: "Back" },
  { id: "e7", name: "Incline Dumbbell Press", muscleGroup: "Chest" },
  { id: "e8", name: "Lateral Raise", muscleGroup: "Shoulders" },
  { id: "e9", name: "Tricep Extension", muscleGroup: "Arms" },
  { id: "e10", name: "Bicep Curl", muscleGroup: "Arms" },
];

const MOCK_WORKOUTS: Workout[] = [
  {
    id: "w1",
    name: "Push Day",
    date: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    startTime: new Date(Date.now() - 86400000 * 2).toISOString(),
    endTime: new Date(Date.now() - 86400000 * 2 + 3600000).toISOString(),
    exercises: [
      {
        id: "we1",
        exerciseId: "e1",
        sets: [
          { id: "s1", reps: 8, weight: 185, completed: true },
          { id: "s2", reps: 8, weight: 185, completed: true },
          { id: "s3", reps: 7, weight: 185, completed: true },
        ]
      },
      {
        id: "we2",
        exerciseId: "e4",
        sets: [
          { id: "s4", reps: 10, weight: 115, completed: true },
          { id: "s5", reps: 9, weight: 115, completed: true },
        ]
      }
    ],
    notes: "Felt strong on bench today."
  },
  {
    id: "w2",
    name: "Pull Day",
    date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    startTime: new Date(Date.now() - 86400000).toISOString(),
    endTime: new Date(Date.now() - 86400000 + 4000000).toISOString(),
    exercises: [
      {
        id: "we3",
        exerciseId: "e3",
        sets: [
          { id: "s6", reps: 5, weight: 315, completed: true },
          { id: "s7", reps: 5, weight: 315, completed: true },
        ]
      },
      {
        id: "we4",
        exerciseId: "e5",
        sets: [
          { id: "s8", reps: 12, weight: 0, completed: true },
          { id: "s9", reps: 10, weight: 0, completed: true },
          { id: "s10", reps: 8, weight: 0, completed: true },
        ]
      }
    ]
  }
];

interface AppState {
  workouts: Workout[];
  exercises: Exercise[];
  globalNotes: Note[];
  unitSystem: UnitSystem;
  theme: "dark" | "light";
  activeWorkoutId: string | null;
  timer: TimerState;
}

interface AppContextType extends AppState {
  startWorkout: (template?: string) => void;
  finishWorkout: () => void;
  updateWorkout: (workout: Workout) => void;
  deleteWorkout: (id: string) => void;
  addExercise: (exercise: Exercise) => void;
  toggleUnitSystem: () => void;
  toggleTheme: () => void;
  getExerciseName: (id: string) => string;
  // Notes
  addNote: (text: string) => void;
  updateNote: (id: string, text: string) => void;
  deleteNote: (id: string) => void;
  // Timer
  setTimerType: (type: 'stopwatch' | 'rest') => void;
  startTimer: (duration?: number) => void;
  pauseTimer: () => void;
  resetTimer: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useState<Workout[]>(() => {
    const saved = localStorage.getItem("ironlog-workouts");
    return saved ? JSON.parse(saved) : MOCK_WORKOUTS;
  });

  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem("ironlog-exercises");
    return saved ? JSON.parse(saved) : DEFAULT_EXERCISES;
  });

  const [globalNotes, setGlobalNotes] = useState<Note[]>(() => {
      const saved = localStorage.getItem("ironlog-notes");
      return saved ? JSON.parse(saved) : [{ id: "1", text: "Focus on form for deadlifts next session. Keep back straight.", date: new Date().toISOString() }];
  });

  const [unitSystem, setUnitSystem] = useState<UnitSystem>(() => {
    return (localStorage.getItem("ironlog-units") as UnitSystem) || "lb";
  });

  const [theme, setTheme] = useState<"dark" | "light">(() => {
    if (typeof window !== "undefined" && document.documentElement.classList.contains("light")) {
        return "light";
    }
    return "dark"; 
  });

  const [activeWorkoutId, setActiveWorkoutId] = useState<string | null>(null);

  const [timer, setTimer] = useState<TimerState>(() => {
      const saved = localStorage.getItem("ironlog-timer");
      return saved ? JSON.parse(saved) : { type: 'rest', startTime: null, duration: 60000, pausedAt: null, isRunning: false };
  });

  useEffect(() => {
    localStorage.setItem("ironlog-workouts", JSON.stringify(workouts));
  }, [workouts]);

  useEffect(() => {
    localStorage.setItem("ironlog-exercises", JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
    localStorage.setItem("ironlog-notes", JSON.stringify(globalNotes));
  }, [globalNotes]);

  useEffect(() => {
    localStorage.setItem("ironlog-units", unitSystem);
  }, [unitSystem]);

  useEffect(() => {
      localStorage.setItem("ironlog-timer", JSON.stringify(timer));
  }, [timer]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
  }, [theme]);

  const startWorkout = (templateName: string = "Custom Workout") => {
    const newWorkout: Workout = {
      id: crypto.randomUUID(),
      name: templateName,
      date: new Date().toISOString(),
      startTime: new Date().toISOString(),
      exercises: [],
      notes: ""
    };
    
    // Simple template logic
    if (templateName === "Push Day") {
        newWorkout.exercises = [
            { id: crypto.randomUUID(), exerciseId: "e1", sets: [{ id: crypto.randomUUID(), reps: 0, weight: 0, completed: false }] },
            { id: crypto.randomUUID(), exerciseId: "e4", sets: [{ id: crypto.randomUUID(), reps: 0, weight: 0, completed: false }] },
            { id: crypto.randomUUID(), exerciseId: "e9", sets: [{ id: crypto.randomUUID(), reps: 0, weight: 0, completed: false }] },
        ];
    } else if (templateName === "Pull Day") {
        newWorkout.exercises = [
            { id: crypto.randomUUID(), exerciseId: "e3", sets: [{ id: crypto.randomUUID(), reps: 0, weight: 0, completed: false }] },
            { id: crypto.randomUUID(), exerciseId: "e5", sets: [{ id: crypto.randomUUID(), reps: 0, weight: 0, completed: false }] },
            { id: crypto.randomUUID(), exerciseId: "e10", sets: [{ id: crypto.randomUUID(), reps: 0, weight: 0, completed: false }] },
        ];
    } else if (templateName === "Leg Day") {
         newWorkout.exercises = [
            { id: crypto.randomUUID(), exerciseId: "e2", sets: [{ id: crypto.randomUUID(), reps: 0, weight: 0, completed: false }] },
        ];
    }

    setWorkouts(prev => [newWorkout, ...prev]);
    setActiveWorkoutId(newWorkout.id);
  };

  const finishWorkout = () => {
    setWorkouts(prev => prev.map(w => {
      if (w.id === activeWorkoutId) {
        return { ...w, endTime: new Date().toISOString() };
      }
      return w;
    }));
    setActiveWorkoutId(null);
  };

  const updateWorkout = (updatedWorkout: Workout) => {
    setWorkouts(prev => prev.map(w => w.id === updatedWorkout.id ? updatedWorkout : w));
  };

  const deleteWorkout = (id: string) => {
    if (activeWorkoutId === id) setActiveWorkoutId(null);
    setWorkouts(prev => prev.filter(w => w.id !== id));
  };

  const addExercise = (newExercise: Exercise) => {
    setExercises(prev => [...prev, newExercise]);
  };

  const toggleUnitSystem = () => {
    setUnitSystem(prev => prev === "kg" ? "lb" : "kg");
  };

  const toggleTheme = () => {
    setTheme(prev => prev === "dark" ? "light" : "dark");
  };

  const getExerciseName = (id: string) => {
    return exercises.find(e => e.id === id)?.name || "Unknown Exercise";
  };

  // Notes Actions
  const addNote = (text: string) => {
      setGlobalNotes(prev => [{ id: crypto.randomUUID(), text, date: new Date().toISOString() }, ...prev]);
  };
  
  const updateNote = (id: string, text: string) => {
      setGlobalNotes(prev => prev.map(n => n.id === id ? { ...n, text } : n));
  };

  const deleteNote = (id: string) => {
      setGlobalNotes(prev => prev.filter(n => n.id !== id));
  };

  // Timer Actions
  const setTimerType = (type: 'stopwatch' | 'rest') => {
      setTimer(prev => ({ ...prev, type, isRunning: false, startTime: null, pausedAt: null }));
  };

  const startTimer = (duration?: number) => {
      setTimer(prev => {
          const now = Date.now();
          let startTime = now;
          
          if (prev.pausedAt && prev.startTime) {
              // Resuming: Adjust start time so elapsed time remains correct
              // elapsed = pausedAt - startTime
              // newStartTime = now - elapsed
              const elapsed = prev.pausedAt - prev.startTime;
              startTime = now - elapsed;
          }

          return {
              ...prev,
              isRunning: true,
              startTime: startTime,
              pausedAt: null,
              duration: duration ?? prev.duration
          };
      });
  };

  const pauseTimer = () => {
      setTimer(prev => ({
          ...prev,
          isRunning: false,
          pausedAt: Date.now()
      }));
  };

  const resetTimer = () => {
      setTimer(prev => ({
          ...prev,
          isRunning: false,
          startTime: null,
          pausedAt: null
      }));
  };

  return (
    <AppContext.Provider value={{
      workouts,
      exercises,
      globalNotes,
      unitSystem,
      theme,
      activeWorkoutId,
      timer,
      startWorkout,
      finishWorkout,
      updateWorkout,
      deleteWorkout,
      addExercise,
      toggleUnitSystem,
      toggleTheme,
      getExerciseName,
      addNote,
      updateNote,
      deleteNote,
      setTimerType,
      startTimer,
      pauseTimer,
      resetTimer
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
