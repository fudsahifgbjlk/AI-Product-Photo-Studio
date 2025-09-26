
import React from 'react';

interface LoaderProps {
  progress: { current: number; total: number };
}

export const Loader: React.FC<LoaderProps> = ({ progress }) => {
  const percentage = progress.total > 0 ? Math.round((progress.current / progress.total) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-slate-200 text-center">
      <h3 className="text-xl font-semibold text-slate-700 mb-2">Generating Images...</h3>
      <p className="text-slate-500 mb-4">Please wait, this may take a few moments.</p>
      <div className="w-full bg-slate-200 rounded-full h-4 overflow-hidden">
        <div
          className="bg-primary-600 h-4 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
      <p className="mt-2 text-sm font-medium text-primary-700">
        {percentage}% ({progress.current} / {progress.total})
      </p>
    </div>
  );
};
