import { useState, useEffect } from "react";
import BetForm from "./components/BetForm.tsx";
import Dashboard from "./components/Dashboard.tsx";
import BetTable from "./components/BetTable.tsx";

function App() {
  const [refreshData, setRefreshData] = useState(false);
  // Simplified - only checks localStorage
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem("darkMode") === "true";
  });

  // Apply dark mode class
  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDarkMode);
    localStorage.setItem("darkMode", String(isDarkMode));
  }, [isDarkMode]);

  const handleBetAdded = () => setRefreshData((prev) => !prev);
  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 p-4 transition-colors duration-200">
      <header className="text-center mb-8 flex justify-between items-center">
        <div className="w-1/3"></div>
        <h1 className="text-4xl font-extrabold">BetMetrics</h1>
        <div className="w-1/3 flex justify-end">
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-200"
            aria-label={isDarkMode ? "Light Mode" : "Dark Mode"}
          >
            {isDarkMode ? "☀️" : "🌙"}
          </button>
        </div>
      </header>

      <main className="container mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <BetForm onBetAdded={handleBetAdded} />
        </div>
        <div className="lg:col-span-2 space-y-8">
          <Dashboard refresh={refreshData} />
          <BetTable refresh={refreshData} />
        </div>
      </main>
    </div>
  );
}

export default App;
