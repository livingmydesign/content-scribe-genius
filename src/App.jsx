import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { navItems } from "./nav-items";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";
import { getStorage, ref, listAll } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA5I3DqBZzOhUZjNmjLxZHPPXDXzxBHHUY",
  authDomain: "content-generator-7e5d0.firebaseapp.com",
  projectId: "content-generator-7e5d0",
  storageBucket: "content-generator-7e5d0.appspot.com",
  messagingSenderId: "1037011428840",
  appId: "1:1037011428840:web:a1e9d9f7d8e6c9f1c9c9c9"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// Function to check Firebase permissions
const checkFirebasePermissions = async () => {
  try {
    // Check Firestore read permission
    const testCollection = collection(db, 'test_collection');
    await getDocs(testCollection);
    console.log('✅ Firestore read permission: OK');
  } catch (error) {
    console.log('❌ Firestore read permission: Failed', error);
  }

  try {
    // Check Firestore write permission
    await addDoc(collection(db, 'test_collection'), { test: true });
    console.log('✅ Firestore write permission: OK');
  } catch (error) {
    console.log('❌ Firestore write permission: Failed', error);
  }

  try {
    // Check Storage read permission
    const storageRef = ref(storage);
    await listAll(storageRef);
    console.log('✅ Storage read permission: OK');
  } catch (error) {
    console.log('❌ Storage read permission: Failed', error);
  }

  try {
    // Check Storage write permission
    const testRef = ref(storage, 'test_file.txt');
    await uploadString(testRef, 'Hello, World!');
    console.log('✅ Storage write permission: OK');
  } catch (error) {
    console.log('❌ Storage write permission: Failed', error);
  }
};

// Run the permission check
checkFirebasePermissions();

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
