import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { materialService } from "../services/materialService";
import {
  MessageSquare,
  Sparkles,
  Send,
  Trash2,
  Copy,
  Check,
  BookOpen,
  User,
  Bot,
  Code2,
} from "lucide-react";

export const AIAssistant = () => {
  const [searchParams] = useSearchParams();
  const [materials, setMaterials] = useState([]);
  const [selectedMaterialId, setSelectedMaterialId] = useState(
    searchParams.get("material") || ""
  );
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content:
        "Hello! I am your AI Doubt Solver & Tutor powered by Gemini. Select a study document above and ask me anything about it—from algorithmic explanations and code snippets to formulas, analogies, and practice problems.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState(null);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    const loadMaterials = async () => {
      try {
        const mats = await materialService.getMaterials();
        setMaterials(mats || []);
        if (!selectedMaterialId && mats && mats.length > 0) {
          setSelectedMaterialId(mats[0]._id);
        }
      } catch (err) {
        console.error("Failed to load materials:", err);
      }
    };
    loadMaterials();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    if (!selectedMaterialId) {
      alert("Please upload and select a study material first so I have context to answer your questions!");
      return;
    }

    const userMsg = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMsg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await materialService.askMaterial(selectedMaterialId, {
        question: userMsg,
        history: newMessages.slice(-6),
      });

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: res.reply },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "Sorry, I encountered an issue processing your request: " +
            (err.response?.data?.message || err.message),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (content, index) => {
    navigator.clipboard.writeText(content);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const handleClear = () => {
    setMessages([
      {
        role: "assistant",
        content:
          "Conversation cleared! What else would you like to explore in your study material?",
      },
    ]);
  };

  const promptSuggestions = [
    "Explain the core concept in simple terms",
    "Provide a step-by-step example with code",
    "What are the most common exam questions?",
    "Give an intuitive real-world analogy",
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-3 sm:space-y-4">
      {/* Header & Material Context Selector */}
      <div className="p-4 sm:p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-[#2f8d46] text-white flex items-center justify-center shadow-xs">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <span>AI Doubt Solver</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-[#1b5e20] dark:text-emerald-300 font-extrabold">
                Gemini Active
              </span>
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedMaterialId}
                onChange={(e) => setSelectedMaterialId(e.target.value)}
                className="bg-transparent text-xs text-[#04AA6D] font-bold focus:outline-none cursor-pointer max-w-[200px] sm:max-w-xs truncate"
              >
                {materials.length === 0 ? (
                  <option value="">No materials uploaded</option>
                ) : (
                  materials.map((m) => (
                    <option key={m._id} value={m._id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                      Context: {m.title}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleClear}
          title="Clear Conversation"
          className="px-3 py-1.5 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 border border-slate-200 dark:border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold self-end sm:self-auto cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 space-y-4">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            {msg.role === "assistant" && (
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#2f8d46] shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
            )}

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-xl p-4 text-xs sm:text-sm leading-relaxed relative group ${
                msg.role === "user"
                  ? "bg-[#04AA6D] text-white shadow-xs font-semibold"
                  : "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.role === "assistant" && (
                <button
                  onClick={() => handleCopy(msg.content, idx)}
                  className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                  title="Copy reply"
                >
                  {copiedIndex === idx ? (
                    <Check className="w-3.5 h-3.5 text-[#04AA6D]" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              )}
            </div>

            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-lg bg-[#2f8d46] text-white flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                <User className="w-4 h-4" />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-start gap-3 justify-start">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-[#2f8d46] shrink-0">
              <Sparkles className="w-4 h-4 animate-spin" />
            </div>
            <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center gap-1.5 shadow-xs">
              <div className="w-2 h-2 rounded-full bg-[#04AA6D] animate-bounce" />
              <div className="w-2 h-2 rounded-full bg-[#04AA6D] animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 rounded-full bg-[#04AA6D] animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {promptSuggestions.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => setInput(suggestion)}
            className="px-3 py-1 rounded-full text-xs font-semibold bg-white dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 hover:text-[#04AA6D] text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 shrink-0 transition-colors cursor-pointer"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <form onSubmit={handleSend} className="relative shrink-0">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a technical doubt, clarify a concept, or request an example..."
          className="w-full pl-4 pr-12 py-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-[#04AA6D] focus:ring-1 focus:ring-[#04AA6D] text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 outline-none shadow-xs"
        />
        <button
          type="submit"
          disabled={!input.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-lg bg-[#04AA6D] hover:bg-[#038d5a] text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-xs cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
