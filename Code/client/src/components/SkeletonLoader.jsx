import React from "react";

export const SkeletonCard = () => {
  return (
    <div className="skeleton-surface p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="h-6 w-12 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="h-8 w-3/4 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="h-3 w-1/2 bg-slate-200 dark:bg-slate-800 rounded" />
      <div className="pt-2 flex gap-2">
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        <div className="h-8 w-20 bg-slate-200 dark:bg-slate-800 rounded-lg" />
      </div>
    </div>
  );
};

export const SkeletonList = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="skeleton-surface p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between"
        >
          <div className="space-y-2 flex-1 mr-4">
            <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
            <div className="h-3 w-32 bg-slate-100 dark:bg-slate-800/60 rounded" />
          </div>
          <div className="h-8 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
        </div>
      ))}
    </div>
  );
};
