import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function UpdateBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handler = () => setShow(true);
    window.addEventListener('sw-update-available', handler);
    return () => window.removeEventListener('sw-update-available', handler);
  }, []);

  const reload = () => {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistration().then(reg => {
            if (reg && reg.waiting) {
                reg.waiting.postMessage({ type: 'SKIP_WAITING' });
            } else {
                window.location.reload();
            }
        });
    } else {
        window.location.reload();
    }
  };

  if (!show) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[60] bg-primary text-primary-foreground p-3 flex justify-between items-center animate-in slide-in-from-top shadow-lg">
      <span className="text-sm font-medium">New version available!</span>
      <div className="flex gap-2">
         <Button size="sm" variant="secondary" onClick={reload} className="h-7 text-xs font-bold px-3">Update</Button>
         <Button size="icon" variant="ghost" onClick={() => setShow(false)} className="h-7 w-7 hover:bg-white/20 text-primary-foreground"><X size={14} /></Button>
      </div>
    </div>
  );
}
