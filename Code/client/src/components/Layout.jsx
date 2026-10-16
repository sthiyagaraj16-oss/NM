import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { useTheme } from "../context/ThemeContext";

export const Layout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { theme } = useTheme();
  const location = useLocation();

  return (
    <div
      className={`app-theme theme-${theme} min-h-screen bg-[#f8f9fa] dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col antialiased selection:bg-[#04AA6D] selection:text-white transition-colors duration-200`}
    >
      {/* Lightweight ambient background accents */}
      <div className="fixed top-0 right-0 w-96 h-96 rounded-full bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-0 left-72 w-96 h-96 rounded-full bg-teal-500/5 dark:bg-teal-500/10 blur-[120px] pointer-events-none" />

      {/* Sidebar navigation */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main app container */}
      <div className="flex-1 flex flex-col lg:pl-72 min-w-0">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <div key={location.pathname} className="page-enter">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
