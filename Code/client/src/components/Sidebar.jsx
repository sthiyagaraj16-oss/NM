import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  CheckSquare,
  HelpCircle,
  MessageSquareText,
  TrendingUp,
  Bell,
  Settings,
  ShieldAlert,
  LogOut,
  Code2,
  Flame,
  Award,
} from "lucide-react";

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const sections = [
    {
      title: "LEARNING & NOTES",
      items: [
        { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
        { label: "Tutorials & Notes", path: "/materials", icon: BookOpen },
        { label: "Study Plan & Roadmap", path: "/study-plan", icon: CalendarDays },
      ],
    },
    {
      title: "PRACTICE & TESTS",
      items: [
        { label: "Practice Arena", path: "/tasks", icon: CheckSquare },
        { label: "Quizzes & Tests", path: "/quizzes", icon: HelpCircle },
        { label: "AI Doubt Solver", path: "/chat", icon: MessageSquareText },
      ],
    },
    {
      title: "ANALYTICS & ACCOUNT",
      items: [
        { label: "Progress & Rank", path: "/progress", icon: TrendingUp },
        { label: "Notifications", path: "/notifications", icon: Bell },
        { label: "Settings", path: "/settings", icon: Settings },
      ],
    },
  ];

  if (user?.role === "admin") {
    sections[2].items.push({
      label: "Admin Portal",
      path: "/admin",
      icon: ShieldAlert,
    });
  }

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 flex flex-col transition-transform duration-300 ease-in-out
          bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm
          ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-6 h-16 sm:h-20 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="w-10 h-10 rounded-xl bg-[#2f8d46] text-white flex items-center justify-center shadow-sm">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-lg font-black tracking-tight text-slate-900 dark:text-white block">
              StudyBuddy
            </span>
            <span className="block text-[11px] font-semibold text-[#04AA6D] dark:text-emerald-400">
              AI Learning System
            </span>
          </div>
        </div>

        {/* Daily Streak / Target Card */}
        <div className="px-4 pt-4 pb-2">
          <div className="p-3 rounded-xl bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-emerald-600/10 dark:bg-emerald-500/20 flex items-center justify-center text-[#2f8d46]">
                <Flame className="w-4 h-4 fill-orange-500 text-orange-500" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {user?.streak || 1} Day Streak
                </p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Target: Practice daily</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#2f8d46] bg-white dark:bg-slate-800 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              <Award className="w-3 h-3" />
              <span>Active</span>
            </div>
          </div>
        </div>

        {/* Navigation grouped list */}
        <nav className="flex-1 px-3 py-2 space-y-4 overflow-y-auto">
          {sections.map((section, sIdx) => (
            <div key={sIdx}>
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-1">
                {section.title}
              </p>
              <div className="space-y-0.5">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <NavLink
                      key={item.path}
                      to={item.path}
                      onClick={onClose}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2 rounded-lg text-xs sm:text-sm transition-all duration-150 group ${
                          isActive
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#1b5e20] dark:text-emerald-300 font-bold border-l-4 border-[#04AA6D]"
                            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/60 font-medium"
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                      <span>{item.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* User profile info & logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#2f8d46] flex items-center justify-center font-bold text-white text-xs shrink-0 uppercase shadow-xs">
                {user?.name ? user.name[0] : "S"}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                  {user?.name || "Student"}
                </p>
                <p className="text-[10px] text-slate-400 truncate capitalize">
                  {user?.role || "student"}
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
