import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { materialService } from "../services/materialService";
import { EmptyState } from "../components/EmptyState";
import {
  CalendarDays,
  Sparkles,
  Clock,
  Target,
  BookOpen,
  Calendar,
  CheckCircle,
  ArrowRight,
  Code2,
} from "lucide-react";

export const StudyPlan = () => {
  const [searchParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    searchParams.get("material") || ""
  );
  const [days, setDays] = useState(7);
  const [hoursPerDay, setHoursPerDay] = useState(2);
  const [goal, setGoal] = useState("Thoroughly understand and prepare for exams");
  const [studyPlan, setStudyPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingMaterials, setFetchingMaterials] = useState(true);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        setFetchingMaterials(true);
        const data = await materialService.getMaterials();
        setMaterials(data || []);
        if (!selectedMaterialId && data && data.length > 0) {
          setSelectedMaterialId(data[0]._id);
        }
      } catch (err) {
        console.error("Failed to load materials:", err);
      } finally {
        setFetchingMaterials(false);
      }
    };
    loadMaterials();
  }, []);

  // When material selected, check if it already has a study plan
  useEffect(() => {
    if (!selectedMaterialId) return;
    const checkExistingPlan = async () => {
      try {
        const mat = await materialService.getMaterial(selectedMaterialId);
        if (mat?.studyPlan) {
          setStudyPlan(mat.studyPlan);
        } else {
          setStudyPlan("");
        }
      } catch (err) {
        console.error("Failed to fetch material details:", err);
      }
    };
    checkExistingPlan();
  }, [selectedMaterialId]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!selectedMaterialId) return;

    setLoading(true);
    try {
      const res = await materialService.generateStudyPlan(selectedMaterialId, {
        days,
        hoursPerDay,
        goal,
      });
      setStudyPlan(res.studyPlan);
    } catch (err) {
      alert("Failed to generate plan: " + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#1b5e20] dark:text-emerald-400 uppercase tracking-wider mb-1">
          <Code2 className="w-3.5 h-3.5 text-[#2f8d46]" />
          <span>Curriculum & Syllabus Roadmap</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Study Plan & Roadmap
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Generate an intelligent, day-by-day learning schedule tailored to your pace and test targets.
        </p>
      </div>

      {fetchingMaterials ? (
        <div className="p-12 text-center text-slate-500 font-medium">Loading tutorials...</div>
      ) : materials.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No materials uploaded yet"
          description="Upload a study document first to generate a structured timeline."
          actionText="Upload Study Document"
          actionLink="/materials"
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
          {/* Left Column: Configuration Form */}
          <div className="p-5 sm:p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 h-fit">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#04AA6D]" />
              <span>Roadmap Parameters</span>
            </h2>

            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Select Study Material
                </label>
                <select
                  value={selectedMaterialId}
                  onChange={(e) => setSelectedMaterialId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04AA6D]"
                >
                  {materials.map((mat) => (
                    <option key={mat._id} value={mat._id}>
                      {mat.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Primary Learning Goal
                </label>
                <div className="relative">
                  <Target className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={goal}
                    onChange={(e) => setGoal(e.target.value)}
                    placeholder="e.g. Master core algorithms for tests"
                    className="w-full pl-9 pr-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#04AA6D]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Completion Target</span>
                  <span className="text-[#04AA6D] font-extrabold">{days} Days</span>
                </div>
                <input
                  type="range"
                  min="3"
                  max="30"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  className="w-full accent-[#04AA6D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                  <span>3 days (Sprint)</span>
                  <span>14 days</span>
                  <span>30 days (Deep)</span>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  <span>Daily Study Commitment</span>
                  <span className="text-[#04AA6D] font-extrabold">{hoursPerDay} Hours / Day</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="8"
                  value={hoursPerDay}
                  onChange={(e) => setHoursPerDay(Number(e.target.value))}
                  className="w-full accent-[#04AA6D] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 mt-1 font-medium">
                  <span>1 hr</span>
                  <span>4 hrs</span>
                  <span>8 hrs</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Gemini is Planning Schedule...</span>
                  </>
                ) : (
                  <>
                    <CalendarDays className="w-4 h-4" />
                    <span>Generate AI Schedule</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right Column: Timeline View */}
          <div className="lg:col-span-2 p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#04AA6D]" />
                <span>Day-by-Day Syllabus Schedule</span>
              </span>
              {studyPlan && (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-[#1b5e20] dark:bg-emerald-950 dark:text-emerald-300 font-extrabold">
                  Active Roadmap
                </span>
              )}
            </h2>

            {loading ? (
              <div className="py-20 text-center space-y-4">
                <div className="w-10 h-10 rounded-full border-3 border-emerald-500/20 border-t-[#04AA6D] animate-spin mx-auto" />
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-bold">
                  Optimizing learning progression and milestones with Gemini AI...
                </p>
              </div>
            ) : studyPlan ? (
              <div className="w3-callout">
                <div className="text-slate-900 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                  {studyPlan}
                </div>
              </div>
            ) : (
              <div className="text-center py-16 text-slate-400 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                <CalendarDays className="w-12 h-12 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">No schedule generated yet</p>
                <p className="text-xs text-slate-500 mt-1">
                  Adjust parameters on the left and click "Generate AI Schedule".
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
