import React, { useState, useEffect } from 'react';
import type { GenerationStyle, PhotoSpec } from '../types';
import { TrashIcon, ChevronDownIcon, ChevronUpIcon, PlusIcon } from './icons';

interface GenerationStyleCardProps {
  style: GenerationStyle;
  onUpdate: (style: GenerationStyle) => void;
  onRemove: (id: string) => void;
}

const defaultPhotoSpec: Omit<PhotoSpec, 'id'> = {
    description: 'A new photo description',
    aspectRatio: '1:1',
};

export const GenerationStyleCard: React.FC<GenerationStyleCardProps> = ({ style, onUpdate, onRemove }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedStyle, setEditedStyle] = useState(style);

  useEffect(() => {
    setEditedStyle(style);
  }, [style]);

  const handleUpdate = () => {
    onUpdate(editedStyle);
    setIsEditing(false);
  };

  const updatePhotoSpec = (specId: string, field: keyof Omit<PhotoSpec, 'id'>, value: string) => {
    setEditedStyle(prev => ({
        ...prev,
        photoSpecs: prev.photoSpecs.map(spec => 
            spec.id === specId ? { ...spec, [field]: value } : spec
        ),
    }));
  };

  const addPhotoSpec = () => {
      setEditedStyle(prev => ({
          ...prev,
          photoSpecs: [...prev.photoSpecs, { ...defaultPhotoSpec, id: crypto.randomUUID() }]
      }));
  };
  
  const removePhotoSpec = (specId: string) => {
      setEditedStyle(prev => ({
          ...prev,
          photoSpecs: prev.photoSpecs.filter(spec => spec.id !== specId)
      }));
  };


  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <h4 className="font-bold text-slate-800">{style.name}</h4>
          <p className="text-sm text-slate-500 truncate">Overall Style: {style.imageType}</p>
          <div className="flex items-center space-x-4 text-xs text-slate-600 mt-1">
            <span>Photos: <span className="font-semibold">{style.photoSpecs.length}</span></span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={() => onRemove(style.id)} className="p-2 text-slate-400 hover:text-red-500 rounded-full transition-colors"><TrashIcon className="w-5 h-5" /></button>
          <button onClick={() => setIsEditing(!isEditing)} className="p-2 text-slate-500 hover:text-primary-600 rounded-full transition-colors">
            {isEditing ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
          </button>
        </div>
      </div>
      {isEditing && (
        <div className="mt-4 pt-4 border-t border-slate-200 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Style Name</label>
                    <input type="text" value={editedStyle.name} onChange={e => setEditedStyle({...editedStyle, name: e.target.value})} className="p-2 bg-white border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"/>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Overall Style</label>
                    <input type="text" value={editedStyle.imageType} onChange={e => setEditedStyle({...editedStyle, imageType: e.target.value})} className="p-2 bg-white border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"/>
                </div>
            </div>
            
            <h5 className="text-md font-semibold text-slate-700 pt-2 border-t">Individual Photos</h5>
            <div className="space-y-3">
            {editedStyle.photoSpecs.map((spec, index) => (
                <div key={spec.id} className="p-3 bg-white border rounded-md">
                    <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-slate-600 mb-2">Photo #{index + 1}</p>
                        <button onClick={() => removePhotoSpec(spec.id)} className="text-slate-400 hover:text-red-500" aria-label="Remove photo spec"><TrashIcon className="w-4 h-4"/></button>
                    </div>
                    <textarea 
                        value={spec.description} 
                        onChange={e => updatePhotoSpec(spec.id, 'description', e.target.value)} 
                        className="p-2 bg-white border border-slate-300 rounded-md w-full h-16 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
                        placeholder="Description / Prompt..."
                    />
                    <select 
                        value={spec.aspectRatio} 
                        onChange={e => updatePhotoSpec(spec.id, 'aspectRatio', e.target.value)} 
                        className="p-2 bg-white border border-slate-300 rounded-md w-full sm:w-auto mt-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"
                    >
                        <option value="1:1">Square (1:1)</option>
                        <option value="4:3">Landscape (4:3)</option>
                        <option value="3:4">Portrait (3:4)</option>
                        <option value="16:9">Widescreen (16:9)</option>
                        <option value="9:16">Story (9:16)</option>
                    </select>
                </div>
            ))}
            </div>

            <button onClick={addPhotoSpec} className="w-full flex items-center justify-center py-2 px-4 border-2 border-dashed border-slate-300 rounded-lg text-sm text-slate-600 hover:border-primary-500 hover:text-primary-600 transition-colors">
                <PlusIcon className="w-4 h-4 mr-2" /> Add Photo
            </button>

            <div className="mt-4 flex justify-end">
                <button onClick={handleUpdate} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md">Save Changes</button>
            </div>
        </div>
      )}
    </div>
  );
};