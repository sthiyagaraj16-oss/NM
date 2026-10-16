import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { userService } from "../services/userService";
import {
  Menu,
  Sun,
  Moon,
  Bell,
  Sparkles,
  ExternalLink,
  Search,
  BookOpen,
  CheckSquare,
  HelpCircle,
  MessageSquare,
  Flame,
} from "lucide-react";

export const Navbar = ({ onToggleSidebar }) => {
  const { user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        const data = await userService.getNotifications();
        setNotifications(data || []);
      } catch (err) {
        // Silently handle if unauthenticated
      }
    };
    fetchNotifs();
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/materials?q=${encodeURIComponent(searchQuery.trim())}`);
  };

  return (
    <header className="sticky top-0 z-30 h-16 sm:h-20 px-4 sm:px-8 flex items-center justify-between border-b border-slate-200/90 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs transition-colors duration-200">
      <div className="flex items-center gap-3 sm:gap-6 flex-1 min-w-0 mr-4">
        {/* Mobile toggle button */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:text-emerald-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden transition-colors shrink-0"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Quick Search */}
        <form
          onSubmit={handleSearchSubmit}
          className="hidden md:flex items-center relative max-w-md w-full"
        >
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tutorials, practice problems, notes..."
            className="w-full pl-9 pr-12 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-lg text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:border-[#04AA6D] focus:ring-1 focus:ring-[#04AA6D] transition-all"
          />
          <span className="absolute right-2.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 bg-slate-200/60 dark:bg-slate-700 px-1.5 py-0.5 rounded">
            Enter
          </span>
        </form>

        {/* Quick Nav Chips */}
        <div className="hidden xl:flex items-center gap-1.5 text-xs font-semibold">
          <Link
            to="/materials"
            className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-[#04AA6D] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex items-center gap-1.5"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#04AA6D]" />
            <span>Tutorials</span>
          </Link>
          <Link
            to="/tasks"
            className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-[#2f8d46] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex items-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5 text-[#2f8d46]" />
            <span>Practice</span>
          </Link>
          <Link
            to="/quizzes"
            className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-[#04AA6D] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex items-center gap-1.5"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#04AA6D]" />
            <span>Quizzes</span>
          </Link>
          <Link
            to="/chat"
            className="px-3 py-1.5 rounded-md text-slate-600 dark:text-slate-300 hover:text-[#2f8d46] hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-[#2f8d46]" />
            <span>Doubt Solver</span>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Streak badge */}
        <div
          title={`${user?.streak || 1} day study streak!`}
          className="flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/50 text-orange-700 dark:text-orange-400"
        >
          <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
          <span>{user?.streak || 1}d</span>
        </div>

        {/* AI Engine Status */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[#1b5e20] dark:text-emerald-400">
          <Sparkles className="w-3.5 h-3.5 text-[#2f8d46]" />
          <span>Gemini AI</span>
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
          className="p-2 sm:p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#04AA6D] hover:border-[#04AA6D] transition-all"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-700" />
          )}
        </button>

        {/* Notifications Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowNotifs(!showNotifs)}
            className="p-2 sm:p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#04AA6D] hover:border-[#04AA6D] transition-all relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#04AA6D] text-[10px] font-bold text-white flex items-center justify-center animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifs && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-4 z-50 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="text-sm font-bold text-slate-900 dark:text-white">Notifications</span>
                <Link
                  to="/notifications"
                  onClick={() => setShowNotifs(false)}
                  className="text-xs text-[#04AA6D] hover:underline font-semibold flex items-center gap-1"
                >
                  View all <ExternalLink className="w-3 h-3" />
                </Link>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                    No notifications yet
                  </p>
                ) : (
                  notifications.slice(0, 4).map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg border text-xs transition-colors ${
                        notif.read
                          ? "bg-slate-50 dark:bg-slate-800/40 border-slate-100 dark:border-slate-800 text-slate-500"
                          : "bg-emerald-50/70 dark:bg-emerald-950/20 border-emerald-200/80 dark:border-emerald-800/60 text-slate-800 dark:text-slate-200"
                      }`}
                    >
                      <p className="font-bold text-slate-900 dark:text-white">{notif.title}</p>
                      <p className="text-slate-600 dark:text-slate-400 mt-0.5">{notif.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Pill */}
        <Link
          to="/settings"
          className="flex items-center gap-2 pl-1.5 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/70 hover:border-[#04AA6D] transition-colors"
        >
          <div className="w-7 h-7 rounded-md bg-[#2f8d46] text-white flex items-center justify-center text-xs font-bold shadow-xs">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline-block max-w-[110px] truncate">
            {user?.name || "Student"}
          </span>
        </Link>
      </div>
    </header>
  );
};
