import React, { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { materialService } from "../services/materialService";
import { SkeletonCard } from "../components/SkeletonLoader";
import {
  Sparkles,
  FileText,
  BookOpen,
  Calendar,
  HelpCircle,
  MessageSquare,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Copy,
  Check,
  Code2,
} from "lucide-react";

export const MaterialDetail = () => {
  const { id } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get("tab") || "summary");

  // Flashcards state
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardCount, setFlashcardCount] = useState(5);
  const [generatingFlashcards, setGeneratingFlashcards] = useState(false);

  // Summary generation state
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchMaterial = async () => {
    try {
      setLoading(true);
      const data = await materialService.getMaterial(id);
      setMaterial(data);
    } catch (err) {
      console.error("Failed to load material:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterial();
  }, [id]);

  const handleSummarize = async () => {
    setGeneratingSummary(true);
    try {
      const res = await materialService.summarize(id);
      setMaterial((prev) => ({ ...prev, summary: res.summary }));
    } catch (err) {
      alert("Failed to generate summary: " + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingSummary(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    setGeneratingFlashcards(true);
    try {
      const res = await materialService.generateFlashcards(id, flashcardCount);
      setMaterial((prev) => ({ ...prev, flashcards: res.flashcards }));
      setCurrentCardIndex(0);
      setIsFlipped(false);
    } catch (err) {
      alert("Failed to generate flashcards: " + (err.response?.data?.message || err.message));
    } finally {
      setGeneratingFlashcards(false);
    }
  };

  const handleCopySummary = () => {
    if (!material?.summary) return;
    navigator.clipboard.writeText(material.summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!material) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Material not found.</p>
        <Link to="/materials" className="text-[#04AA6D] font-bold hover:underline mt-2 inline-block">
          Back to Tutorials Library
        </Link>
      </div>
    );
  }

  const flashcards = material.flashcards || [];

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div>
        <Link
          to="/materials"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#04AA6D] transition-colors mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Tutorials Library / {material.title}</span>
        </Link>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-[#1b5e20] dark:text-emerald-300">
                Study Article
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {material.filename} • {new Date(material.createdAt).toLocaleDateString()}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              {material.title}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={`/quizzes?material=${material._id}`}
              className="px-4 py-2 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <HelpCircle className="w-4 h-4" />
              <span>Take Quiz</span>
            </Link>
            <Link
              to={`/chat?material=${material._id}`}
              className="px-4 py-2 rounded-lg bg-[#2f8d46] hover:bg-[#237035] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Ask AI Doubt Solver</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Study Tabs */}
      <div className="flex items-center gap-1 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        {[
          { id: "summary", label: "Key Concepts & Summary", icon: Sparkles },
          { id: "flashcards", label: `Flashcards (${flashcards.length})`, icon: BookOpen },
          { id: "studyPlan", label: "Study Roadmap", icon: Calendar },
          { id: "content", label: "Raw Document", icon: FileText },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                setSearchParams({ tab: tab.id });
              }}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                activeTab === tab.id
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-[#1b5e20] dark:text-emerald-300 border-b-2 border-[#04AA6D]"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Summary */}
      {activeTab === "summary" && (
        <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#1b5e20] dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#04AA6D]" />
              <span>Study Notes & Summary</span>
            </div>
            {material.summary && (
              <button
                onClick={handleCopySummary}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white text-xs font-bold transition-colors cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#04AA6D]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? "Copied" : "Copy Notes"}</span>
              </button>
            )}
          </div>

          {material.summary ? (
            <div className="w3-callout">
              <div className="text-slate-900 dark:text-slate-100 text-sm leading-relaxed whitespace-pre-wrap font-sans">
                {material.summary}
              </div>
            </div>
          ) : (
            <div className="text-center py-12 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">
                No summary generated yet
              </p>
              <p className="text-xs text-slate-500 mb-4">
                Let Gemini extract the key definitions, principles, and bullet points.
              </p>
              <button
                onClick={handleSummarize}
                disabled={generatingSummary}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                {generatingSummary ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Analyzing & Summarizing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Summary</span>
                  </>
                )}
              </button>
            </div>
          )}

          {material.summary && (
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end">
              <button
                onClick={handleSummarize}
                disabled={generatingSummary}
                className="text-xs text-[#04AA6D] hover:underline flex items-center gap-1.5 font-bold cursor-pointer"
              >
                <RotateCw className={`w-3.5 h-3.5 ${generatingSummary ? "animate-spin" : ""}`} />
                <span>Regenerate Summary</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Tab: Flashcards (Interactive 3D Flip Deck) */}
      {activeTab === "flashcards" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-2">
              <label className="text-xs font-bold text-slate-600 dark:text-slate-400">Card Deck Size:</label>
              <select
                value={flashcardCount}
                onChange={(e) => setFlashcardCount(Number(e.target.value))}
                className="bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-md px-2.5 py-1 text-xs font-semibold focus:outline-none focus:border-[#04AA6D]"
              >
                <option value="5">5 Cards</option>
                <option value="10">10 Cards</option>
                <option value="15">15 Cards</option>
              </select>
            </div>

            <button
              onClick={handleGenerateFlashcards}
              disabled={generatingFlashcards}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2f8d46] hover:bg-[#237035] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              {generatingFlashcards ? (
                <>
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                  <span>Generating Deck...</span>
                </>
              ) : (
                <>
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{flashcards.length > 0 ? "Regenerate Cards" : "Generate Flashcards"}</span>
                </>
              )}
            </button>
          </div>

          {flashcards.length === 0 ? (
            <div className="text-center py-16 rounded-xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800">
              <BookOpen className="w-10 h-10 text-slate-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Flashcards Created Yet</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                Generate dynamic flashcards to test your memory and active recall on this topic.
              </p>
              <button
                onClick={handleGenerateFlashcards}
                disabled={generatingFlashcards}
                className="px-5 py-2.5 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                Generate First Deck
              </button>
            </div>
          ) : (
            <div className="max-w-xl mx-auto space-y-4">
              {/* 3D Flip Card Container */}
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="cursor-pointer min-h-[280px] sm:min-h-[320px] rounded-2xl p-8 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-emerald-950/20 border-2 border-emerald-300 dark:border-emerald-800 shadow-md flex flex-col justify-between transition-all duration-300 hover:border-[#04AA6D] relative"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#1b5e20] dark:text-emerald-300 font-extrabold">
                    Card {currentCardIndex + 1} of {flashcards.length}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">Click to flip</span>
                </div>

                <div className="my-auto text-center py-6">
                  {!isFlipped ? (
                    <div className="space-y-3">
                      <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#2f8d46]">
                        Question / Concept
                      </span>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white leading-snug">
                        {flashcards[currentCardIndex]?.question}
                      </h3>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-in fade-in zoom-in-95 duration-200">
                      <span className="inline-block text-[11px] font-extrabold uppercase tracking-wider text-[#04AA6D]">
                        Answer / Explanation
                      </span>
                      <p className="text-base sm:text-lg font-medium text-slate-800 dark:text-slate-100 leading-relaxed">
                        {flashcards[currentCardIndex]?.answer}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-center text-xs text-[#04AA6D] gap-1.5 font-bold">
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>{isFlipped ? "Show Question" : "Reveal Answer"}</span>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-2">
                <button
                  disabled={currentCardIndex === 0}
                  onClick={() => {
                    setCurrentCardIndex((prev) => Math.max(0, prev - 1));
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#04AA6D] text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <span className="text-xs text-slate-600 dark:text-slate-400 font-bold">
                  {currentCardIndex + 1} / {flashcards.length}
                </span>

                <button
                  disabled={currentCardIndex === flashcards.length - 1}
                  onClick={() => {
                    setCurrentCardIndex((prev) => Math.min(flashcards.length - 1, prev + 1));
                    setIsFlipped(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:border-[#04AA6D] text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-1.5 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab: Study Plan */}
      {activeTab === "studyPlan" && (
        <div className="p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#04AA6D]" />
              <span>Personalized Study Roadmap</span>
            </h2>
            <Link
              to={`/study-plan?material=${material._id}`}
              className="text-xs text-[#04AA6D] hover:underline font-bold"
            >
              Configure Parameters →
            </Link>
          </div>

          {material.studyPlan ? (
            <div className="w3-callout text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
              {material.studyPlan}
            </div>
          ) : (
            <div className="text-center py-10 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
                No study roadmap generated yet
              </p>
              <Link
                to={`/study-plan?material=${material._id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white text-xs font-bold shadow-xs"
              >
                <Calendar className="w-4 h-4" />
                <span>Create Study Roadmap</span>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Tab: Content */}
      {activeTab === "content" && (
        <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Code2 className="w-4 h-4 text-[#2f8d46]" />
              <span>Full Text Extract</span>
            </h2>
            <span className="text-xs text-slate-500">
              {(material.content?.length || 0).toLocaleString()} characters
            </span>
          </div>
          <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono-code text-xs text-slate-800 dark:text-slate-300 max-h-96 overflow-y-auto whitespace-pre-wrap leading-relaxed">
            {material.content}
          </div>
        </div>
      )}
    </div>
  );
};
