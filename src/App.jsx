import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  // Add your Firebase configuration here
  apiKey: "AIzaSyAJbLj7_8Yp-Gbrs_rlpayUTw6BbCAgf5s",
  authDomain: "source-d28de.firebaseapp.com",
  projectId: "source-d28de",
  storageBucket: "source-d28de.appspot.com",
  messagingSenderId: "283060039877",
  appId: "1:283060039877:web:070f58a7bb016a7e36c0ac",
  measurementId: "G-LJE5RB45RM"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <BrowserRouter>
        <Routes>
          {navItems.map(({ to, page }) => (
            <Route key={to} path={to} element={page} />
          ))}
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
