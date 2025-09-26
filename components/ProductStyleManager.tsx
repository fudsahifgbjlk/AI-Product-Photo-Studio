import React, { useState, useEffect } from 'react';
import type { GenerationStyle, PhotoSpec } from '../types';
import { GenerationStyleCard } from './GenerationStyleCard';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { PlusIcon, SaveIcon, FolderOpenIcon } from './icons';

interface ProductStyleManagerProps {
  generationStyles: GenerationStyle[];
  setGenerationStyles: (updater: GenerationStyle[] | ((prev: GenerationStyle[]) => GenerationStyle[])) => void;
}

type SavedTemplates = { [templateName: string]: GenerationStyle[] };

const defaultPhotoSpec: Omit<PhotoSpec, 'id'> = {
  description: 'Product on a clean, white background, studio lighting',
  aspectRatio: '1:1',
};

const defaultStyle: Omit<GenerationStyle, 'id' | 'name'> = {
  imageType: 'Studio',
  photoSpecs: [{...defaultPhotoSpec, id: crypto.randomUUID() }],
};

export const ProductStyleManager: React.FC<ProductStyleManagerProps> = ({ generationStyles, setGenerationStyles }) => {
  const [savedTemplates, setSavedTemplates] = useLocalStorage<SavedTemplates>('ai-product-photo-templates-v2', {});
  const [showForm, setShowForm] = useState(false);
  const [showLoadUI, setShowLoadUI] = useState(false);
  const [newStyle, setNewStyle] = useState<Omit<GenerationStyle, 'id'>>({
      name: `Style ${generationStyles.length + 1}`,
      ...defaultStyle
  });

  const addStyle = () => {
    if (newStyle.name && newStyle.imageType) {
      setGenerationStyles(prev => [...prev, { ...newStyle, id: crypto.randomUUID() }]);
      setNewStyle({
        name: `Style ${generationStyles.length + 2}`,
        ...defaultStyle
      });
      setShowForm(false);
    }
  };

  const updateStyle = (updatedStyle: GenerationStyle) => {
    setGenerationStyles(prev => prev.map(s => s.id === updatedStyle.id ? updatedStyle : s));
  };

  const removeStyle = (id: string) => {
    setGenerationStyles(prev => prev.filter(s => s.id !== id));
  };

  const saveCurrentStylesAsTemplate = () => {
    if (generationStyles.length === 0) {
      alert('There are no styles to save as a template.');
      return;
    }
    const name = prompt('Enter a name for this template:');
    if (name) {
      setSavedTemplates(prev => ({...prev, [name]: generationStyles }));
      alert(`Template "${name}" saved!`);
    }
  };

  const loadTemplate = (name: string) => {
    if (savedTemplates[name]) {
      const newStylesWithNewIds = savedTemplates[name].map(style => ({ 
        ...style, 
        id: crypto.randomUUID(),
        photoSpecs: style.photoSpecs.map(spec => ({...spec, id: crypto.randomUUID()}))
      }));
      setGenerationStyles(prev => [...prev, ...newStylesWithNewIds]);
    }
    setShowLoadUI(false);
  };

  useEffect(() => {
    if (generationStyles.length === 0) {
      setShowForm(true);
    } else {
      setShowForm(false);
    }
  }, [generationStyles.length]);

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-slate-800">2. Configure Generation Styles</h2>
        <div className="relative flex items-center space-x-2">
            <button onClick={saveCurrentStylesAsTemplate} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-primary-600 rounded-full transition-colors" title="Save current styles as template"><SaveIcon className="w-5 h-5"/></button>
            <button onClick={() => setShowLoadUI(prev => !prev)} className="p-2 text-slate-500 hover:bg-slate-100 hover:text-primary-600 rounded-full transition-colors" title="Load styles from template"><FolderOpenIcon className="w-5 h-5"/></button>
            {showLoadUI && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-md shadow-lg z-10 border border-slate-200">
                  <p className="p-3 text-sm font-semibold text-slate-800 border-b">Apply a Template</p>
                  <ul className="py-1 max-h-48 overflow-y-auto">
                      {Object.keys(savedTemplates).length > 0 ? Object.keys(savedTemplates).map(name => (
                          <li key={name}>
                              <button
                                  onClick={() => loadTemplate(name)}
                                  className="block w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-100"
                              >
                                  {name}
                              </button>
                          </li>
                      )) : <li className="px-3 py-2 text-sm text-slate-500">No templates saved.</li>}
                  </ul>
              </div>
            )}
        </div>
      </div>

      <div className="space-y-4">
        {generationStyles.map(style => (
          <GenerationStyleCard key={style.id} style={style} onUpdate={updateStyle} onRemove={removeStyle} />
        ))}
      </div>

      {showForm && (
        <div className="mt-4 p-4 border border-slate-200 rounded-lg bg-slate-50">
            <h3 className="font-semibold mb-2 text-slate-700">Add New Style</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input type="text" placeholder="Style Name (e.g., 'E-commerce Pack')" value={newStyle.name} onChange={e => setNewStyle({...newStyle, name: e.target.value})} className="p-2 bg-white border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"/>
                <input type="text" placeholder="Overall Style (e.g., 'Lifestyle')" value={newStyle.imageType} onChange={e => setNewStyle({...newStyle, imageType: e.target.value})} className="p-2 bg-white border border-slate-300 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"/>
            </div>
            <p className="text-sm font-medium text-slate-600 mt-4 mb-2">Initial Photo:</p>
            <textarea placeholder="Description / Prompt" value={newStyle.photoSpecs[0].description} onChange={e => {
                const updatedSpecs = [...newStyle.photoSpecs];
                updatedSpecs[0].description = e.target.value;
                setNewStyle({...newStyle, photoSpecs: updatedSpecs});
            }} className="p-2 bg-white border border-slate-300 rounded-md w-full col-span-2 h-20 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors"/>
             <select value={newStyle.photoSpecs[0].aspectRatio} onChange={e => {
                const updatedSpecs = [...newStyle.photoSpecs];
                updatedSpecs[0].aspectRatio = e.target.value as PhotoSpec['aspectRatio'];
                setNewStyle({...newStyle, photoSpecs: updatedSpecs});
             }} className="p-2 bg-white border border-slate-300 rounded-md mt-2 focus:outline-none focus:ring-2 focus:ring-primary-400 focus:border-primary-400 transition-colors">
                <option value="1:1">Square (1:1)</option>
                <option value="4:3">Landscape (4:3)</option>
                <option value="3:4">Portrait (3:4)</option>
                <option value="16:9">Widescreen (16:9)</option>
                <option value="9:16">Story (9:16)</option>
            </select>
            <div className="mt-4 flex justify-end space-x-2">
                <button onClick={() => setShowForm(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-200 hover:bg-slate-300 rounded-md">Cancel</button>
                <button onClick={addStyle} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-md">Add Style</button>
            </div>
        </div>
      )}

      {!showForm && (
        <button onClick={() => setShowForm(true)} className="mt-4 w-full flex items-center justify-center py-2 px-4 border-2 border-dashed border-slate-300 rounded-lg text-slate-600 hover:border-primary-500 hover:text-primary-600 transition-colors">
          <PlusIcon className="w-5 h-5 mr-2" /> Add Another Style
        </button>
      )}

    </div>
  );
};