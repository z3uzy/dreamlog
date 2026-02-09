import { Layout } from "@/components/Layout";
import { useApp } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Scale, Shield, Info } from "lucide-react";

export default function Settings() {
  const { unitSystem, toggleUnitSystem, theme, toggleTheme } = useApp();

  return (
    <Layout>
      <div className="p-4 space-y-6 max-w-md mx-auto animate-in fade-in duration-500">
        <h1 className="text-2xl font-bold font-heading">Settings</h1>

        <div className="space-y-6">
            <section className="space-y-3">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-1">Preferences</h2>
                <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                    <div className="p-4 flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-foreground">
                                {theme === 'dark' ? <Moon size={16} /> : <Sun size={16} />}
                            </div>
                            <span className="font-medium">Dark Mode</span>
                        </div>
                        <Switch checked={theme === 'dark'} onCheckedChange={toggleTheme} />
                    </div>
                    <div className="p-4 flex justify-between items-center">
                         <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-foreground">
                                <Scale size={16} />
                            </div>
                            <span className="font-medium">Unit System</span>
                        </div>
                        <button 
                            onClick={toggleUnitSystem}
                            className="text-xs font-bold bg-secondary px-3 py-1.5 rounded-lg border border-border hover:bg-secondary/80 transition-colors"
                        >
                            {unitSystem.toUpperCase()}
                        </button>
                    </div>
                </div>
            </section>

             <section className="space-y-3">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-1">About</h2>
                <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                    <div className="p-4 flex items-center gap-3">
                        <Shield size={18} className="text-muted-foreground" />
                        <div>
                            <p className="font-medium">Privacy First</p>
                            <p className="text-xs text-muted-foreground">Data is stored locally on your device.</p>
                        </div>
                    </div>
                     <div className="p-4 flex items-center gap-3">
                        <Info size={18} className="text-muted-foreground" />
                        <div>
                            <p className="font-medium">IronLog v0.1.0</p>
                            <p className="text-xs text-muted-foreground">Mockup Build</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
      </div>
    </Layout>
  );
}
