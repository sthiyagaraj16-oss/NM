import React, { useState, useEffect } from "react";
import { userService } from "../services/userService";
import { EmptyState } from "../components/EmptyState";
import { SkeletonList } from "../components/SkeletonLoader";
import {
  Bell,
  Flame,
  CheckSquare,
  HelpCircle,
  Info,
  Check,
  Code2,
} from "lucide-react";

export const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifs = async () => {
      try {
        setLoading(true);
        const data = await userService.getNotifications();
        setNotifications(data || []);
      } catch (err) {
        console.error("Failed to load notifications:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifs();
  }, []);

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type) => {
    switch (type) {
      case "streak":
        return <Flame className="w-5 h-5 text-orange-500 fill-orange-500" />;
      case "task":
        return <CheckSquare className="w-5 h-5 text-[#2f8d46]" />;
      case "quiz":
        return <HelpCircle className="w-5 h-5 text-[#04AA6D]" />;
      default:
        return <Info className="w-5 h-5 text-teal-600" />;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1b5e20] dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Code2 className="w-3.5 h-3.5 text-[#2f8d46]" />
            <span>Alerts & Reminders</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Stay informed on your study reminders, streak milestones, and daily problem goals.
          </p>
        </div>

        {notifications.some((n) => !n.read) && (
          <button
            onClick={handleMarkAllRead}
            className="px-3.5 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-[#1b5e20] dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer hover:bg-[#04AA6D] hover:text-white"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Mark all read</span>
          </button>
        )}
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="All caught up!"
          description="You don't have any unread notifications right now."
        />
      ) : (
        <div className="space-y-2.5">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 sm:p-5 rounded-xl border transition-all flex items-start gap-4 ${
                notif.read
                  ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-500"
                  : "bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-900/60 text-slate-800 dark:text-slate-200 shadow-xs"
              }`}
            >
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-slate-800 border border-emerald-200/80 dark:border-slate-700 shrink-0">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{notif.title}</h3>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(notif.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">{notif.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
