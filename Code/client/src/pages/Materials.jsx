import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { materialService } from "../services/materialService";
import { SkeletonList } from "../components/SkeletonLoader";
import { EmptyState } from "../components/EmptyState";
import {
  UploadCloud,
  FileText,
  Sparkles,
  BookOpen,
  HelpCircle,
  Calendar,
  CheckSquare,
  MessageSquare,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ArrowUpRight,
  Code2,
} from "lucide-react";

export const Materials = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [customTitle, setCustomTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [actionMessage, setActionMessage] = useState("");

  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  const fetchMaterials = async () => {
    try {
      setLoading(true);
      const data = await materialService.getMaterials();
      setMaterials(data || []);
    } catch (err) {
      console.error("Failed to load materials:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMaterials();
  }, []);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    setError("");
    const allowed = [".txt", ".md", ".pdf"];
    const ext = "." + file.name.split(".").pop().toLowerCase();

    if (!allowed.includes(ext)) {
      setError("Please upload a supported file format (.txt, .md, .pdf).");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("File size exceeds the 5MB limit.");
      return;
    }

    setSelectedFile(file);
    if (!customTitle) {
      setCustomTitle(file.name.replace(/\.[^/.]+$/, ""));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setError("");
    setSuccess("");
    setUploading(true);

    try {
      await materialService.uploadMaterial(selectedFile, customTitle);
      setSuccess(`"${customTitle || selectedFile.name}" uploaded successfully!`);
      setSelectedFile(null);
      setCustomTitle("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      await fetchMaterials();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to upload study material.");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? All associated summaries and quizzes will be removed.`)) {
      return;
    }

    try {
      await materialService.deleteMaterial(id);
      setMaterials((prev) => prev.filter((m) => m._id !== id));
    } catch (err) {
      alert("Failed to delete material: " + (err.response?.data?.message || err.message));
    }
  };

  const handleQuickAction = async (materialId, actionType) => {
    setActionLoadingId(materialId);
    try {
      if (actionType === "summarize") {
        setActionMessage("AI is generating tutorial summary...");
        await materialService.summarize(materialId);
        navigate(`/materials/${materialId}?tab=summary`);
      } else if (actionType === "flashcards") {
        setActionMessage("AI is creating 5 smart flashcards...");
        await materialService.generateFlashcards(materialId, 5);
        navigate(`/materials/${materialId}?tab=flashcards`);
      } else if (actionType === "quiz") {
        setActionMessage("AI is generating MCQ practice test...");
        await materialService.generateQuiz(materialId, 5);
        navigate(`/quizzes?material=${materialId}`);
      } else if (actionType === "tasks") {
        setActionMessage("AI is decomposing syllabus into practice tasks...");
        await materialService.generateTasks(materialId);
        navigate("/tasks");
      }
    } catch (err) {
      alert("Action failed: " + (err.response?.data?.message || err.message));
    } finally {
      setActionLoadingId(null);
      setActionMessage("");
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-xs font-bold text-[#1b5e20] dark:text-emerald-400 uppercase tracking-wider mb-1">
          <Code2 className="w-3.5 h-3.5 text-[#2f8d46]" />
          <span>Documentation & Tutorial Library</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Study Materials & Notes
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
          Upload textbook chapters, lecture notes, or code cheat-sheets to generate structured summaries and practice tests.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="p-6 sm:p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
        <form onSubmit={handleUpload}>
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
              dragActive
                ? "border-[#04AA6D] bg-emerald-50 dark:bg-emerald-950/30 scale-[0.99]"
                : "border-emerald-300/80 dark:border-emerald-900/60 hover:border-[#04AA6D] bg-emerald-50/30 dark:bg-emerald-950/10"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.md,.pdf"
              onChange={handleFileChange}
              className="hidden"
            />

            <div className="w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#2f8d46] mx-auto mb-3 shadow-xs">
              <UploadCloud className="w-7 h-7" />
            </div>

            {selectedFile ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#1b5e20] dark:text-emerald-300">
                  Ready to upload: {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {(selectedFile.size / 1024).toFixed(1)} KB • Click or drop another to replace
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                  Drag and drop your study document, or{" "}
                  <span className="text-[#04AA6D] underline">browse files</span>
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Supported formats: .TXT, .MD, .PDF (Max 5MB)
                </p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div className="mt-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-center gap-3">
              <input
                type="text"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                placeholder="Give this material a title (optional)"
                className="w-full px-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#04AA6D]"
              />
              <button
                type="submit"
                disabled={uploading}
                className="w-full sm:w-auto px-6 py-2 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white text-xs sm:text-sm font-bold transition-all shrink-0 flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white/20 border-t-white animate-spin" />
                    <span>Processing Document...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Upload & Process</span>
                  </>
                )}
              </button>
            </div>
          )}

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 text-xs flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mt-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-[#1b5e20] dark:text-emerald-400 text-xs flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}
        </form>
      </div>

      {/* Action Processing Alert Banner */}
      {actionLoadingId && (
        <div className="p-4 rounded-xl bg-[#04AA6D] text-white flex items-center justify-center gap-3 animate-pulse shadow-md font-semibold text-sm">
          <Sparkles className="w-5 h-5 animate-spin" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Materials List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Tutorial Repository</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
              {materials.length} {materials.length === 1 ? "article" : "articles"}
            </span>
          </h2>
        </div>

        {loading ? (
          <SkeletonList count={3} />
        ) : materials.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No tutorials uploaded yet"
            description="Upload study notes or documentation above to unlock AI summaries, flashcard practice, and adaptive quizzes."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {materials.map((mat) => (
              <div
                key={mat._id}
                className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-[#04AA6D] transition-all flex flex-col justify-between group shadow-xs"
              >
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 flex items-center justify-center text-[#2f8d46] shrink-0">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <button
                      onClick={() => handleDelete(mat._id, mat.title)}
                      className="p-1.5 text-slate-400 hover:text-red-600 rounded-md hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
                      title="Delete Material"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <Link
                    to={`/materials/${mat._id}`}
                    className="group-hover:text-[#04AA6D] transition-colors block"
                  >
                    <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-1 flex items-center gap-1.5">
                      <span>{mat.title}</span>
                      <ArrowUpRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </h3>
                  </Link>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    File: {mat.filename}
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    Added on {new Date(mat.createdAt).toLocaleDateString()}
                  </p>
                </div>

                {/* AI Quick Actions Grid */}
                <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickAction(mat._id, "summarize")}
                      disabled={!!actionLoadingId}
                      className="px-2.5 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 hover:bg-[#04AA6D] hover:text-white text-[#1b5e20] dark:text-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3 text-[#2f8d46] group-hover:text-white" />
                      <span>Summary</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction(mat._id, "flashcards")}
                      disabled={!!actionLoadingId}
                      className="px-2.5 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 hover:bg-[#2f8d46] hover:text-white text-[#1b5e20] dark:text-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3 text-[#2f8d46] group-hover:text-white" />
                      <span>Flashcards</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleQuickAction(mat._id, "quiz")}
                      disabled={!!actionLoadingId}
                      className="px-2.5 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 hover:bg-[#04AA6D] hover:text-white text-[#1b5e20] dark:text-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer"
                    >
                      <HelpCircle className="w-3 h-3 text-[#2f8d46] group-hover:text-white" />
                      <span>Take Quiz</span>
                    </button>
                    <button
                      onClick={() => handleQuickAction(mat._id, "tasks")}
                      disabled={!!actionLoadingId}
                      className="px-2.5 py-1.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 hover:bg-[#2f8d46] hover:text-white text-[#1b5e20] dark:text-emerald-300 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 border border-emerald-200 dark:border-emerald-800/60 cursor-pointer"
                    >
                      <CheckSquare className="w-3 h-3 text-[#2f8d46] group-hover:text-white" />
                      <span>Roadmap</span>
                    </button>
                  </div>

                  <Link
                    to={`/chat?material=${mat._id}`}
                    className="w-full py-1.5 rounded-md bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3 h-3 text-[#2f8d46]" />
                    <span>Ask AI Doubt Solver</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
