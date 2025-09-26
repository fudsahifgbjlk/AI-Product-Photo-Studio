import React, { useCallback } from 'react';
import type { ProductImage } from '../types';
import { UploadIcon, XCircleIcon } from './icons';

interface ImageUploaderProps {
  productImages: ProductImage[];
  setProductImages: React.Dispatch<React.SetStateAction<ProductImage[]>>;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({ productImages, setProductImages }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const files = Array.from(event.target.files);
      const newImages: ProductImage[] = files.map((file: File) => ({
        id: `${file.name}-${file.lastModified}`,
        file,
        previewUrl: URL.createObjectURL(file),
      }));
      setProductImages(prev => [...prev, ...newImages]);
    }
  }, [setProductImages]);

  const removeImage = (id: string) => {
    setProductImages(prev => prev.filter(image => image.id !== id));
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
      <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
        1. Upload Product Photos
      </h2>
      <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-primary-500 transition-colors cursor-pointer bg-slate-50">
        <input
          type="file"
          id="file-upload"
          multiple
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="sr-only"
        />
        <label htmlFor="file-upload" className="cursor-pointer">
          <UploadIcon className="w-12 h-12 mx-auto text-slate-400" />
          <p className="mt-2 text-slate-600">
            <span className="font-semibold text-primary-600">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500 mt-1">PNG, JPG, WEBP</p>
        </label>
      </div>

      {productImages.length > 0 && (
        <div className="mt-6">
          <h3 className="font-semibold text-slate-700 mb-3">Uploaded Products ({productImages.length})</h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-4">
            {productImages.map(image => (
              <div key={image.id} className="relative group">
                <img src={image.previewUrl} alt={image.file.name} className="w-full h-24 object-cover rounded-lg shadow-md" />
                <button
                  onClick={() => removeImage(image.id)}
                  className="absolute top-0 right-0 -mt-2 -mr-2 bg-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove image"
                >
                  <XCircleIcon className="w-6 h-6 text-red-500 hover:text-red-700" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};