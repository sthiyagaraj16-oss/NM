import React, { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { materialService } from "../services/materialService";
import { quizService } from "../services/quizService";
import { EmptyState } from "../components/EmptyState";
import confetti from "canvas-confetti";
import {
  HelpCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Award,
  AlertTriangle,
  Code2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export const Quiz = () => {
  const [searchParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    searchParams.get("material") || ""
  );
  const [material, setMaterial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  // Quiz running state
  const [quizStarted, setQuizStarted] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState({}); // { [index]: selectedOption }
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);

  // Load materials list
  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        const mats = await materialService.getMaterials();
        setMaterials(mats || []);
        if (!selectedMaterialId && mats && mats.length > 0) {
          setSelectedMaterialId(mats[0]._id);
        }
      } catch (err) {
        console.error("Failed to load materials:", err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []);

  // When material selected, load its details
  useEffect(() => {
    if (!selectedMaterialId) return;
    const loadMat = async () => {
      try {
        const data = await materialService.getMaterial(selectedMaterialId);
        setMaterial(data);
        setQuizStarted(false);
        setResults(null);
        setUserAnswers({});
        setCurrentIndex(0);
      } catch (err) {
        console.error("Failed to load material:", err);
      }
    };
    loadMat();
  }, [selectedMaterialId]);

  const handleGenerateQuiz = async () => {
    if (!selectedMaterialId) return;
    setGenerating(true);
    try {
      const res = await materialService.generateQuiz(selectedMaterialId, 5);
      setMaterial((prev) => ({ ...prev, quiz: res.quiz }));
      setQuizStarted(true);
      setUserAnswers({});
      setCurrentIndex(0);
      setResults(null);
    } catch (err) {
      alert("Failed to generate quiz: " + (err.response?.data?.message || err.message));
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (questionIdx, optionText) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionIdx]: optionText,
    }));
  };

  const handleSubmitQuiz = async () => {
    const quizQuestions = material?.quiz || [];
    const formattedAnswers = quizQuestions.map((q, idx) => ({
      questionIndex: idx,
      selectedAnswer: userAnswers[idx] || "",
    }));

    setSubmitting(true);
    try {
      const res = await quizService.submitQuiz(selectedMaterialId, formattedAnswers);
      setResults(res);

      if (res.percentage >= 75) {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
        });
      }
    } catch (err) {
      alert("Failed to submit quiz: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const questions = material?.quiz || [];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#1b5e20] dark:text-emerald-400 uppercase tracking-wider mb-1">
          <Code2 className="w-3.5 h-3.5 text-[#2f8d46]" />
          <span>Practice Arena</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Quizzes & Tests
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Evaluate your understanding with AI-generated multiple-choice questions and instant detailed solutions.
        </p>
      </div>

      {/* Material Selector */}
      {materials.length > 0 && !quizStarted && !results && (
        <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#2f8d46]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Topic / Material</p>
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-900 dark:text-white focus:outline-none cursor-pointer mt-0.5"
              >
                {materials.map((m) => (
                  <option key={m._id} value={m._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleGenerateQuiz}
            disabled={generating}
            className="px-5 py-2.5 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
          >
            {generating ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                <span>Crafting Questions...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{questions.length > 0 ? "Regenerate Test Questions" : "Generate AI Assessment"}</span>
              </>
            )}
          </button>
        </div>
      )}

      {/* Empty State */}
      {materials.length === 0 && !loading && (
        <EmptyState
          icon={HelpCircle}
          title="No materials available for assessments"
          description="Upload your study materials first, and Gemini AI will automatically craft practice tests for you."
          actionText="Upload Material"
          actionLink="/materials"
        />
      )}

      {/* Pre-Quiz Launch Card */}
      {!quizStarted && !results && material && (
        <div className="p-8 sm:p-12 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center max-w-xl mx-auto space-y-6 shadow-xs">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#2f8d46] mx-auto shadow-xs">
            <HelpCircle className="w-8 h-8" />
          </div>

          <div>
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#1b5e20] dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-2.5 py-0.5 rounded">
              Ready to Practice
            </span>
            <h2 className="text-xl font-black text-slate-900 dark:text-white mt-2">
              {questions.length > 0 ? `${questions.length} MCQ Questions Ready` : "No Assessment Available"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2">
              Topic: "{material.title}". Test your knowledge, receive detailed explanations, and spot weak areas.
            </p>
          </div>

          {questions.length > 0 ? (
            <button
              onClick={() => {
                setQuizStarted(true);
                setCurrentIndex(0);
                setUserAnswers({});
              }}
              className="px-8 py-3 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white font-bold text-sm shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
            >
              <span>Start Assessment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleGenerateQuiz}
              disabled={generating}
              className="px-8 py-3 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white font-bold text-sm shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Quiz with AI</span>
            </button>
          )}
        </div>
      )}

      {/* Quiz Runner */}
      {quizStarted && !results && questions.length > 0 && (
        <div className="max-w-2xl mx-auto p-6 sm:p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          {/* Question Navigator Bubbles */}
          <div className="flex items-center justify-between gap-2 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2 overflow-x-auto py-1">
              {questions.map((_, qIdx) => {
                const isCurrent = qIdx === currentIndex;
                const isAnswered = userAnswers[qIdx] !== undefined;
                return (
                  <button
                    key={qIdx}
                    onClick={() => setCurrentIndex(qIdx)}
                    className={`w-8 h-8 rounded-lg text-xs font-bold transition-all shrink-0 cursor-pointer ${
                      isCurrent
                        ? "bg-[#04AA6D] text-white shadow-xs"
                        : isAnswered
                        ? "bg-emerald-100 text-[#1b5e20] dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {qIdx + 1}
                  </button>
                );
              })}
            </div>
            <span className="text-xs font-bold text-slate-500 shrink-0">
              {Object.keys(userAnswers).length}/{questions.length} Answered
            </span>
          </div>

          {/* Question Text */}
          <div className="py-2">
            <span className="text-xs font-extrabold text-[#2f8d46] uppercase tracking-wider">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white leading-relaxed mt-1">
              {questions[currentIndex]?.question}
            </h2>
          </div>

          {/* Options List */}
          <div className="space-y-2.5">
            {questions[currentIndex]?.options?.map((opt, oIdx) => {
              const isSelected = userAnswers[currentIndex] === opt;
              return (
                <button
                  key={oIdx}
                  onClick={() => handleSelectOption(currentIndex, opt)}
                  className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold cursor-pointer ${
                    isSelected
                      ? "border-2 border-[#04AA6D] bg-emerald-50 dark:bg-emerald-950/40 text-slate-900 dark:text-white"
                      : "border-slate-200 dark:border-slate-700 bg-slate-50/60 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:border-[#04AA6D] hover:bg-emerald-50/20"
                  }`}
                >
                  <span>{opt}</span>
                  <div
                    className={`w-6 h-6 rounded-md border flex items-center justify-center text-xs font-extrabold shrink-0 ${
                      isSelected
                        ? "border-[#04AA6D] bg-[#04AA6D] text-white"
                        : "border-slate-300 dark:border-slate-600 text-slate-500 bg-white dark:bg-slate-900"
                    }`}
                  >
                    {String.fromCharCode(65 + oIdx)}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Bottom Action Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              className="px-4 py-2 rounded-lg text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {currentIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentIndex((prev) => prev + 1)}
                className="px-5 py-2.5 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
              >
                <span>Next Question</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmitQuiz}
                disabled={submitting}
                className="px-6 py-2.5 rounded-lg bg-[#2f8d46] hover:bg-[#237035] text-white text-xs font-bold shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Scoring Quiz...</span>
                  </>
                ) : (
                  <span>Submit Assessment</span>
                )}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results View */}
      {results && (
        <div className="max-w-2xl mx-auto space-y-6">
          {/* Score Header Card */}
          <div className="p-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#2f8d46] mx-auto">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white">
                {results.percentage}%
              </h2>
              <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-1">
                You solved {results.score} of {results.totalQuestions} questions correctly!
              </p>
            </div>

            {results.percentage >= 80 ? (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-[#1b5e20] dark:bg-emerald-950 dark:text-emerald-300">
                🎉 Outstanding Geek Mastery!
              </span>
            ) : (
              <span className="inline-block px-3 py-1 rounded-full text-xs font-extrabold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                📚 Keep Practicing Core Concepts
              </span>
            )}

            {/* Weak Topics Callout */}
            {results.weakTopics && results.weakTopics.length > 0 && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-left mt-4">
                <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs mb-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Topics to Review</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {results.weakTopics.map((wt, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-md text-xs font-semibold bg-white dark:bg-slate-800 border border-amber-200 text-amber-800 dark:text-amber-300"
                    >
                      {wt}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => {
                  setResults(null);
                  setQuizStarted(true);
                  setCurrentIndex(0);
                  setUserAnswers({});
                }}
                className="px-5 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center gap-2 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Quiz</span>
              </button>
              <Link
                to={`/chat?material=${selectedMaterialId}`}
                className="px-5 py-2.5 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-all"
              >
                <span>Ask Doubt Solver About Mistakes</span>
              </Link>
            </div>
          </div>

          {/* Question Breakdown List */}
          <div className="space-y-3">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Solution Breakdown</h3>
            {results.answers?.map((ans, aIdx) => (
              <div
                key={aIdx}
                className={`p-4 rounded-xl border ${
                  ans.isCorrect
                    ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                    : "bg-red-50/60 dark:bg-red-950/20 border-red-200 dark:border-red-900"
                }`}
              >
                <div className="flex items-start gap-3">
                  {ans.isCorrect ? (
                    <CheckCircle2 className="w-5 h-5 text-[#04AA6D] shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  )}
                  <div className="text-xs sm:text-sm space-y-1">
                    <p className="font-bold text-slate-900 dark:text-white">{ans.questionText}</p>
                    <p className="text-slate-600 dark:text-slate-400 text-xs">
                      Your answer:{" "}
                      <span className={ans.isCorrect ? "text-[#04AA6D] font-bold" : "text-red-600 font-bold"}>
                        {ans.selectedAnswer || "No answer chosen"}
                      </span>
                    </p>
                    {!ans.isCorrect && (
                      <p className="text-[#04AA6D] text-xs font-bold">
                        Correct answer: {ans.correctAnswer}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
