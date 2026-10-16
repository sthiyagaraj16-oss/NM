import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { userService } from "../services/userService";
import { quizService } from "../services/quizService";
import { SkeletonList } from "../components/SkeletonLoader";
import {
  Flame,
  Award,
  CheckCircle2,
  Code2,
} from "lucide-react";

export const Progress = () => {
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statsData, histData] = await Promise.all([
          userService.getStats(),
          quizService.getHistory(),
        ]);
        setStats(statsData);
        setHistory(histData || []);
      } catch (err) {
        console.error("Failed to load progress data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const tiers = [
    { name: "Beginner", threshold: "Start journey" },
    { name: "Basic", threshold: "2+ problems solved" },
    { name: "Intermediate", threshold: "7+ problems solved" },
    { name: "Advanced", threshold: "15+ problems & 75%+ score" },
    { name: "Master", threshold: "25+ problems & 80%+ score" },
  ];

  const currentTierIndex = tiers.findIndex(
    (t) => t.name.toLowerCase() === (stats?.masteryTier || "beginner").toLowerCase()
  );

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#1b5e20] dark:text-emerald-400 uppercase tracking-wider mb-1">
          <Code2 className="w-3.5 h-3.5 text-[#2f8d46]" />
          <span>Performance Analytics</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Study Progress & Mastery
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Monitor your streak consistency, practice milestones, and mastery progress over time.
        </p>
      </div>

      {loading ? (
        <SkeletonList count={4} />
      ) : (
        <>
          {/* Streak & Rank Banner */}
          <div className="p-6 sm:p-8 rounded-xl bg-gradient-to-r from-orange-50/80 via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-orange-950/20 border border-orange-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-orange-100 dark:bg-orange-950/40 border border-orange-300 dark:border-orange-800 flex items-center justify-center text-orange-500 shrink-0">
                <Flame className="w-8 h-8 fill-orange-500 text-orange-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
                    {stats?.streak || 1} Days
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border border-orange-200">
                    Active Streak 🔥
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 font-medium">
                  Consistent daily learning. Target: {stats?.studyGoalHours || 2} hours daily.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-right md:text-left shrink-0 shadow-xs">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Tier</p>
              <p className="text-lg font-black text-amber-600 dark:text-amber-400 flex items-center gap-2 mt-0.5">
                <Award className="w-5 h-5 text-amber-500" />
                <span>{stats?.masteryTier || "Beginner"}</span>
              </p>
            </div>
          </div>

          {/* Mastery Tiers Progression */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Mastery Pathway
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
              {tiers.map((tier, idx) => {
                const isUnlocked = idx <= currentTierIndex;
                const isCurrent = idx === currentTierIndex;
                return (
                  <div
                    key={idx}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? "border-2 border-[#04AA6D] bg-emerald-50/80 dark:bg-emerald-950/30 text-slate-900 dark:text-white shadow-xs"
                        : isUnlocked
                        ? "border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-950/10 text-slate-800 dark:text-slate-200"
                        : "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 opacity-50 text-slate-400"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-bold">{tier.name}</span>
                      {isUnlocked && <CheckCircle2 className="w-4 h-4 text-[#04AA6D]" />}
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
                      {tier.threshold}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Materials Uploaded</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats?.totalMaterials || 0}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Documents & notes</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Problems Solved</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
                {stats?.completedTasks || 0} / {stats?.totalTasks || 0}
              </p>
              <p className="text-[11px] text-[#04AA6D] font-bold mt-0.5">
                {stats?.taskCompletionRate || 0}% solved
              </p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Quizzes Attempted</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats?.totalQuizzes || 0}</p>
              <p className="text-[11px] text-slate-500 mt-0.5">Assessments graded</p>
            </div>

            <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Average Score</span>
              <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{stats?.averageQuizScore || 0}%</p>
              <p className="text-[11px] text-[#2f8d46] font-bold mt-0.5">Retention rate</p>
            </div>
          </div>

          {/* Quiz Attempt History */}
          <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Recent Assessment History
              </h2>
              <Link to="/quizzes" className="text-xs text-[#04AA6D] hover:underline font-bold">
                Start new quiz →
              </Link>
            </div>

            {history.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">
                No quiz attempts yet. Complete a quiz to view your score trends.
              </p>
            ) : (
              <div className="space-y-2.5">
                {history.map((att) => (
                  <div
                    key={att._id}
                    className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-4"
                  >
                    <div>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {att.material?.title || "Study Material"}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Completed on {new Date(att.createdAt).toLocaleDateString()} •{" "}
                        {att.score}/{att.totalQuestions} correct
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-base font-black ${
                          att.percentage >= 80
                            ? "text-[#04AA6D]"
                            : att.percentage >= 60
                            ? "text-emerald-700 dark:text-emerald-400"
                            : "text-amber-600"
                        }`}
                      >
                        {att.percentage}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
