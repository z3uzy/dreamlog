import { Link, useLocation } from "wouter";
import { Home, Dumbbell, BarChart2, Notebook, Settings, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/store";

export function Layout({ children }: { children: React.ReactNode }) {
  const { activeWorkoutId } = useApp();
  
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground pb-20 safe-area-bottom">
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      <BottomNav activeWorkoutId={activeWorkoutId} />
    </div>
  );
}

function BottomNav({ activeWorkoutId }: { activeWorkoutId: string | null }) {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Dumbbell, label: "Workout", href: activeWorkoutId ? `/workout/${activeWorkoutId}` : "/workout" },
    { icon: BarChart2, label: "Progress", href: "/progress" },
    { icon: Notebook, label: "Notes", href: "/notes" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-lg border-t border-border pb-[env(safe-area-inset-bottom)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href.startsWith("/workout") && location.startsWith("/workout"));
          const Icon = item.icon;
          
          return (
            <Link key={item.label} href={item.href}>
              <div className={cn(
                "flex flex-col items-center justify-center w-full h-full p-2 transition-all duration-200 cursor-pointer group",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}>
                <div className={cn(
                  "relative p-1.5 rounded-xl transition-all duration-300",
                  isActive && "bg-primary/10"
                )}>
                  <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                  {item.label === "Workout" && activeWorkoutId && (
                    <span className="absolute -top-1 -right-1 flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                  )}
                </div>
                <span className="text-[10px] font-medium mt-1">{item.label}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
