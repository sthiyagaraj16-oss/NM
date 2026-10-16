import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { userService } from "../services/userService";
import { taskService } from "../services/taskService";
import { SkeletonCard, SkeletonList } from "../components/SkeletonLoader";
import confetti from "canvas-confetti";
import {
  Sparkles,
  Flame,
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  ArrowRight,
  Award,
  PlusCircle,
  HelpCircle,
  MessageSquare,
  Code2,
  ChevronRight,
} from "lucide-react";

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [todayTasks, setTodayTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, tasksData] = await Promise.all([
        userService.getStats(),
        taskService.getTasks(),
      ]);
      setStats(statsData);
      setTodayTasks(tasksData.slice(0, 4));
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleToggleTask = async (taskId, currentCompleted) => {
    try {
      const updated = await taskService.updateTask(taskId, {
        completed: !currentCompleted,
      });

      // Confetti burst on task completion
      if (!currentCompleted) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      setTodayTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, completed: updated.completed } : t))
      );

      // Refresh stats
      const newStats = await userService.getStats();
      setStats(newStats);
    } catch (err) {
      console.error("Failed to update task:", err);
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric",
  });

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Learning Portal Welcome Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-white to-teal-50/70 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border border-emerald-200/80 dark:border-slate-800 shadow-xs relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-[#1b5e20] dark:text-emerald-400 mb-2">
              <span className="bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
                {currentDate}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 bg-orange-100 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded">
                <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500" />
                {stats?.streak || user?.streak || 1} Day Streak
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Welcome back, {user?.name || "Student"}! 🚀
            </h1>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1.5 max-w-xl font-normal">
              Ready for your daily practice sprint? Review key tutorial notes and verify your retention with interactive practice problems.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/materials"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white text-xs sm:text-sm font-bold transition-all shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Upload Notes</span>
            </Link>
            <Link
              to="/chat"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs sm:text-sm font-bold border border-slate-300 dark:border-slate-700 transition-all shadow-xs"
            >
              <MessageSquare className="w-4 h-4 text-[#2f8d46]" />
              <span>Ask Doubt Solver</span>
            </Link>
          </div>
        </div>

        {/* Subtle decorative code tag watermark */}
        <div className="absolute right-4 -bottom-6 text-emerald-500/10 dark:text-emerald-500/5 font-mono-code font-black text-9xl select-none pointer-events-none">
          &lt;/&gt;
        </div>
      </div>

      {/* Metric Stat Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Task Completion */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#04AA6D] transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Practice Progress</span>
              <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[#04AA6D]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {stats?.taskCompletionRate || 0}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({stats?.completedTasks || 0}/{stats?.totalTasks || 0} solved)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
              <div
                className="h-full bg-[#04AA6D] rounded-full transition-all duration-500"
                style={{ width: `${stats?.taskCompletionRate || 0}%` }}
              />
            </div>
          </div>

          {/* Card 2: Quiz Accuracy */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#2f8d46] transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Quiz Accuracy</span>
              <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/40 text-[#2f8d46]">
                <HelpCircle className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {stats?.averageQuizScore || 0}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                ({stats?.totalQuizzes || 0} taken)
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
              <div
                className="h-full bg-[#2f8d46] rounded-full transition-all duration-500"
                style={{ width: `${stats?.averageQuizScore || 0}%` }}
              />
            </div>
          </div>

          {/* Card 3: Study Materials */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-[#04AA6D] transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Tutorials & Docs</span>
              <div className="p-1.5 rounded-md bg-teal-50 dark:bg-teal-950/40 text-teal-600">
                <BookOpen className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                {stats?.totalMaterials || 0}
              </span>
              <span className="text-xs text-slate-500 font-medium">materials</span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Ready for AI note generation
            </p>
          </div>

          {/* Card 4: Mastery Tier */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400 transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-2">
              <span className="text-xs font-bold uppercase tracking-wider">Geek Rank</span>
              <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-600">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400">
                {stats?.masteryTier || "Beginner"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2 font-medium">
              Level up with practice tasks
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Practice Tasks & Continue Learning */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left Column (2 cols): Today's Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Daily Practice Problems</span>
                <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-[#1b5e20] dark:bg-emerald-950 dark:text-emerald-300">
                  {todayTasks.filter((t) => !t.completed).length} to do
                </span>
              </h2>
            </div>
            <Link
              to="/tasks"
              className="text-xs font-bold text-[#04AA6D] hover:underline flex items-center gap-1"
            >
              Practice Arena <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <SkeletonList count={3} />
          ) : todayTasks.length === 0 ? (
            <div className="p-8 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-center">
              <CheckCircle2 className="w-8 h-8 text-[#04AA6D] mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                All daily practice problems completed!
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                Upload new tutorial materials to auto-generate adaptive problem sets.
              </p>
              <Link
                to="/materials"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white text-xs font-bold"
              >
                Go to Tutorials Library
              </Link>
            </div>
          ) : (
            <div className="space-y-2.5">
              {todayTasks.map((task) => (
                <div
                  key={task._id}
                  className={`p-4 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                    task.completed
                      ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400"
                      : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#04AA6D] text-slate-800 dark:text-slate-200 shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button
                      onClick={() => handleToggleTask(task._id, task.completed)}
                      className="shrink-0 p-1 text-slate-400 hover:text-[#04AA6D] transition-colors cursor-pointer"
                      title={task.completed ? "Mark incomplete" : "Mark completed"}
                    >
                      {task.completed ? (
                        <CheckCircle2 className="w-5 h-5 text-[#04AA6D] fill-emerald-100 dark:fill-emerald-950" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-400 hover:text-[#04AA6D]" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <p
                        className={`text-sm font-semibold truncate ${
                          task.completed
                            ? "line-through text-slate-400 dark:text-slate-500"
                            : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {task.estimatedMinutes || 25} min
                        </span>
                        <span>•</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            task.difficulty === "Beginner"
                              ? "gfg-badge-easy"
                              : task.difficulty === "Advanced"
                              ? "gfg-badge-hard"
                              : "gfg-badge-medium"
                          }`}
                        >
                          {task.difficulty || "Intermediate"}
                        </span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleToggleTask(task._id, task.completed)}
                    className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      task.completed
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-500"
                        : "bg-emerald-50 text-[#1b5e20] dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-[#04AA6D] hover:text-white border border-emerald-200 dark:border-emerald-800"
                    }`}
                  >
                    {task.completed ? "Solved" : "Solve"}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column (1 col): Continue Learning & Weak Topics */}
        <div className="space-y-6">
          {/* Continue Learning Card */}
          <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-sm font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3 flex items-center justify-between">
              <span>Continue Reading</span>
              <BookOpen className="w-4 h-4 text-[#04AA6D]" />
            </h2>
            {stats?.recentMaterial ? (
              <div className="space-y-4">
                <div className="w3-callout">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {stats.recentMaterial.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {stats.recentMaterial.summary
                      ? "AI Summary & Flashcard deck available"
                      : "Ready for practice tests & flashcards"}
                  </p>
                </div>

                <Link
                  to={`/materials/${stats.recentMaterial._id}`}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors shadow-xs"
                >
                  <span>Resume Study Session</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              <div className="text-center py-6 text-slate-500">
                <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-xs">No active study materials yet</p>
                <Link
                  to="/materials"
                  className="mt-2 inline-block text-xs font-bold text-[#04AA6D] hover:underline"
                >
                  Upload your first document
                </Link>
              </div>
            )}
          </div>

          {/* Weak Topics to Revise */}
          {stats?.weakTopics && stats.weakTopics.length > 0 && (
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <div className="flex items-center gap-2 mb-2 text-amber-600 dark:text-amber-400">
                <Sparkles className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">Topics to Revise</h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                Identified from recent quiz answers:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {stats.weakTopics.map((topic, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-semibold bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300"
                  >
                    {topic}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quick AI Doubt Box */}
          <div className="p-5 rounded-xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-emerald-950/20 border border-emerald-200 dark:border-slate-800">
            <div className="flex items-center gap-2 mb-1 text-[#1b5e20] dark:text-emerald-400">
              <Code2 className="w-4 h-4" />
              <h3 className="text-xs font-bold uppercase tracking-wider">AI Doubt Solver</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Have doubts on algorithms, formulas, or notes? Ask the AI Tutor anytime.
            </p>
            <Link
              to="/chat"
              className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-[#04AA6D] hover:underline"
            >
              <span>Open Doubt Assistant</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
