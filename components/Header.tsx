
import React from 'react';
import { CameraIcon } from './icons';

export const Header: React.FC = () => {
  return (
    <header className="bg-white shadow-md border-b border-slate-200">
      <div className="container mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
            <div className="bg-primary-600 p-2 rounded-lg text-white">
                <CameraIcon className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-bold text-slate-800">AI Product Photo Studio</h1>
        </div>
        <div className="text-sm text-slate-500">
            Powered by Gemini
        </div>
      </div>
    </header>
  );
};
