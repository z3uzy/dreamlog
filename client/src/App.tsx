import { Switch, Route } from "wouter";
import { AppProvider } from "@/lib/store";
import { Toaster } from "@/components/ui/toaster";

import Home from "@/pages/Home";
import WorkoutPage from "@/pages/Workout";
import Progress from "@/pages/Progress";
import Notes from "@/pages/Notes";
import Settings from "@/pages/Settings";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/workout" component={WorkoutPage} />
      <Route path="/workout/:id" component={WorkoutPage} />
      <Route path="/progress" component={Progress} />
      <Route path="/notes" component={Notes} />
      <Route path="/settings" component={Settings} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AppProvider>
      <Toaster />
      <Router />
    </AppProvider>
  );
}

export default App;
