import React, { useState, useEffect } from "react";
import { taskService } from "../services/taskService";
import { materialService } from "../services/materialService";
import { EmptyState } from "../components/EmptyState";
import { SkeletonList } from "../components/SkeletonLoader";
import confetti from "canvas-confetti";
import {
  CheckSquare,
  CheckCircle2,
  Circle,
  Clock,
  Plus,
  Trash2,
  BookOpen,
  Filter,
  Sparkles,
  Code2,
} from "lucide-react";

export const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // 'all' | 'pending' | 'completed'

  // Modal / form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskDifficulty, setNewTaskDifficulty] = useState("Intermediate");
  const [newTaskMinutes, setNewTaskMinutes] = useState(30);
  const [newTaskMaterial, setNewTaskMaterial] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const [taskData, matData] = await Promise.all([
        taskService.getTasks(),
        materialService.getMaterials(),
      ]);
      setTasks(taskData || []);
      setMaterials(matData || []);
    } catch (err) {
      console.error("Failed to load tasks:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleToggle = async (taskId, currentCompleted) => {
    try {
      const updated = await taskService.updateTask(taskId, {
        completed: !currentCompleted,
      });

      if (!currentCompleted) {
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { y: 0.6 },
        });
      }

      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, completed: updated.completed } : t))
      );
    } catch (err) {
      alert("Failed to update task: " + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await taskService.deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
    } catch (err) {
      alert("Failed to delete task: " + (err.response?.data?.message || err.message));
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    setSubmitting(true);
    try {
      const created = await taskService.createTask({
        title: newTaskTitle.trim(),
        description: newTaskDesc.trim(),
        difficulty: newTaskDifficulty,
        estimatedMinutes: Number(newTaskMinutes),
        materialId: newTaskMaterial || undefined,
      });
      setTasks((prev) => [created, ...prev]);
      setShowAddModal(false);
      setNewTaskTitle("");
      setNewTaskDesc("");
    } catch (err) {
      alert("Failed to create task: " + (err.response?.data?.message || err.message));
    } finally {
      setSubmitting(false);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    if (filter === "pending") return !t.completed;
    if (filter === "completed") return t.completed;
    return true;
  });

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#1b5e20] dark:text-emerald-400 uppercase tracking-wider mb-1">
            <Code2 className="w-3.5 h-3.5 text-[#2f8d46]" />
            <span>Problem of the Day & Exercises</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
            Practice Arena
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
            Solve structured practice tasks generated from your study notes or create custom exercises.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Practice Problem</span>
        </button>
      </div>

      {/* Filter Tabs & Counter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              filter === "all"
                ? "bg-[#04AA6D] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            All Problems ({tasks.length})
          </button>
          <button
            onClick={() => setFilter("pending")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              filter === "pending"
                ? "bg-[#04AA6D] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            Pending ({pendingCount})
          </button>
          <button
            onClick={() => setFilter("completed")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
              filter === "completed"
                ? "bg-[#04AA6D] text-white shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60"
            }`}
          >
            Solved ({completedCount})
          </button>
        </div>

        <div className="text-xs text-slate-500 font-medium">
          {tasks.length > 0 && (
            <span>
              Solved rate:{" "}
              <strong className="text-[#04AA6D] font-bold">
                {Math.round((completedCount / tasks.length) * 100)}%
              </strong>
            </span>
          )}
        </div>
      </div>

      {/* Task List */}
      {loading ? (
        <SkeletonList count={4} />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title={filter === "completed" ? "No problems solved yet" : "No practice problems found"}
          description="Tasks can be generated automatically from any document in your Tutorials & Notes library."
          actionText="Open Tutorials"
          actionLink="/materials"
        />
      ) : (
        <div className="space-y-2.5">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className={`p-4 sm:p-5 rounded-xl border transition-all flex items-start sm:items-center justify-between gap-4 ${
                task.completed
                  ? "bg-slate-50 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 text-slate-400"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-[#04AA6D] text-slate-800 dark:text-slate-200 shadow-xs"
              }`}
            >
              <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                <button
                  onClick={() => handleToggle(task._id, task.completed)}
                  className="mt-0.5 sm:mt-0 p-1 text-slate-400 hover:text-[#04AA6D] transition-colors shrink-0 cursor-pointer"
                  title={task.completed ? "Mark unsolved" : "Mark solved"}
                >
                  {task.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-[#04AA6D] fill-emerald-100 dark:fill-emerald-950" />
                  ) : (
                    <Circle className="w-5 h-5 hover:text-[#04AA6D]" />
                  )}
                </button>

                <div className="min-w-0">
                  <h3
                    className={`text-sm font-bold truncate ${
                      task.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-white"
                    }`}
                  >
                    {task.title}
                  </h3>
                  {task.description && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                      {task.description}
                    </p>
                  )}

                  <div className="flex flex-wrap items-center gap-2 mt-2 text-xs text-slate-500">
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
                    {task.material?.title && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[160px]">
                          <BookOpen className="w-3 h-3 shrink-0 text-[#2f8d46]" />
                          <span className="truncate">{task.material.title}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  onClick={() => handleToggle(task._id, task.completed)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                    task.completed
                      ? "bg-slate-100 dark:bg-slate-800 text-slate-500"
                      : "bg-emerald-50 text-[#1b5e20] dark:bg-emerald-950/40 dark:text-emerald-300 hover:bg-[#04AA6D] hover:text-white border border-emerald-200 dark:border-emerald-800"
                  }`}
                >
                  {task.completed ? "Solved" : "Solve"}
                </button>
                <button
                  onClick={() => handleDelete(task._id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors cursor-pointer"
                  title="Delete task"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Task Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-md p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl space-y-4">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Plus className="w-4 h-4 text-[#04AA6D]" />
              <span>Create Practice Problem</span>
            </h2>

            <form onSubmit={handleCreateTask} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Problem Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="e.g. Implement binary search and write notes"
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#04AA6D]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Notes & Details
                </label>
                <textarea
                  rows="2"
                  value={newTaskDesc}
                  onChange={(e) => setNewTaskDesc(e.target.value)}
                  placeholder="Add problem notes or concepts to revise..."
                  className="w-full px-3.5 py-2 text-xs sm:text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:border-[#04AA6D] resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Difficulty Level
                  </label>
                  <select
                    value={newTaskDifficulty}
                    onChange={(e) => setNewTaskDifficulty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#04AA6D]"
                  >
                    <option value="Beginner">Easy (Beginner)</option>
                    <option value="Intermediate">Medium (Intermediate)</option>
                    <option value="Advanced">Hard (Advanced)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Estimated Time (min)
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="180"
                    value={newTaskMinutes}
                    onChange={(e) => setNewTaskMinutes(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#04AA6D]"
                  />
                </div>
              </div>

              {materials.length > 0 && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Link to Tutorial Material (optional)
                  </label>
                  <select
                    value={newTaskMaterial}
                    onChange={(e) => setNewTaskMaterial(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-white focus:outline-none focus:border-[#04AA6D]"
                  >
                    <option value="">None (Independent problem)</option>
                    {materials.map((m) => (
                      <option key={m._id} value={m._id}>
                        {m.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-bold text-slate-500 hover:text-slate-800 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Creating..." : "Save Problem"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
