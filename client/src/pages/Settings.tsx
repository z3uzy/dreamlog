import { Layout } from "@/components/Layout";
import { useApp } from "@/lib/store";
import { Switch } from "@/components/ui/switch";
import { Moon, Sun, Scale, Shield, Info, Download, Upload, AlertCircle, FolderInput, FileUp, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
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

export default function Settings() {
  const { unitSystem, toggleUnitSystem, theme, toggleTheme, exportData, exportDataManually, importData } = useApp();
  const [includePhotos, setIncludePhotos] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleQuickExport = async () => {
      try {
          await exportData(includePhotos);
          toast({
              title: "Export Successful",
              description: "Saved to default Downloads folder.",
          });
      } catch (error) {
          toast({
              title: "Export Failed",
              description: "Could not export data.",
              variant: "destructive"
          });
      }
  };

  const handleManualExport = async () => {
      try {
          const fileName = await exportDataManually(includePhotos);
          toast({
              title: "Export Successful",
              description: `Saved as ${fileName}`,
          });
      } catch (error: any) {
          if (error.message === "Export cancelled") return;
          toast({
              title: "Export Failed",
              description: error.message || "Could not export data.",
              variant: "destructive"
          });
      }
  };

  const handleImportClick = () => {
      fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // We need to confirm before overwriting
      setPendingFile(file);
      setIsImportDialogOpen(true);
      
      // Reset input
      e.target.value = "";
  };

  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);

  const confirmImport = async () => {
      if (!pendingFile) return;
      try {
          await importData(pendingFile);
          toast({
              title: "Import Successful",
              description: "Your data has been restored.",
          });
          setIsImportDialogOpen(false);
          setPendingFile(null);
          // Force reload to ensure all state is fresh? 
          setTimeout(() => window.location.reload(), 500); 
      } catch (error) {
           toast({
              title: "Import Failed",
              description: "Invalid file format or corrupted data.",
              variant: "destructive"
          });
      }
  };

  return (
    <Layout>
      <div className="p-4 space-y-6 max-w-md mx-auto animate-in fade-in duration-500 pb-10">
        <h1 className="text-2xl font-bold font-heading">Settings</h1>

        <div className="space-y-6">
            <section className="space-y-3">
                <h2 className="text-sm font-bold text-muted-foreground uppercase tracking-wider pl-1">Data Management</h2>
                <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                    <div className="p-4 space-y-4">
                        {/* Options */}
                        <div className="flex justify-between items-center">
                             <div className="flex items-center gap-3">
                                <span className="font-medium text-sm">Include Photos in Export</span>
                            </div>
                            <Switch checked={includePhotos} onCheckedChange={setIncludePhotos} />
                        </div>
                        
                        {/* Storage Location Section */}
                        <div className="space-y-2 pt-2">
                             <h3 className="text-xs font-bold text-muted-foreground uppercase">Storage Location & Export</h3>
                             <div className="grid gap-3">
                                <Button variant="outline" className="h-auto py-3 flex justify-start border-primary/20 hover:bg-primary/5 hover:text-primary relative group" onClick={handleQuickExport}>
                                    <div className="bg-secondary p-2 rounded-lg mr-3 group-hover:bg-background transition-colors">
                                        <Download size={18} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-sm">Quick Export</div>
                                        <div className="text-[10px] text-muted-foreground">Save to Default Folder</div>
                                    </div>
                                </Button>

                                <Button variant="outline" className="h-auto py-3 flex justify-start border-primary/20 hover:bg-primary/5 hover:text-primary relative group" onClick={handleManualExport}>
                                     <div className="bg-secondary p-2 rounded-lg mr-3 group-hover:bg-background transition-colors">
                                        <FolderOpen size={18} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-sm">Choose Location & Export</div>
                                        <div className="text-[10px] text-muted-foreground">Select Folder Manually</div>
                                    </div>
                                </Button>
                             </div>
                        </div>

                        <div className="pt-2">
                            <h3 className="text-xs font-bold text-muted-foreground uppercase mb-2">Restore Data</h3>
                            <Button variant="outline" className="w-full h-12 border-primary/20 hover:bg-primary/5 hover:text-primary" onClick={handleImportClick}>
                                <Upload size={18} className="mr-2" /> Import Data
                            </Button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept=".gymdata,.json" 
                                onChange={handleFileChange}
                            />
                        </div>
                    </div>
                </div>
            </section>

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
                            <p className="font-medium">DreamLog v1.0.1</p>
                            <p className="text-xs text-muted-foreground">PWA Build</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>

        <AlertDialog open={isImportDialogOpen} onOpenChange={setIsImportDialogOpen}>
            <AlertDialogContent className="rounded-2xl max-w-xs">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertCircle size={20} />
                        Overwrite Data?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        This will replace all your current workouts, exercises, and notes with the data from the file. This action cannot be undone.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmImport} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">
                        Yes, Overwrite
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
      </div>
    </Layout>
  );
}
