
import React from 'react';
import type { GeneratedImage, ProductImage } from '../types';
import { DownloadIcon } from './icons';

interface ResultsGalleryProps {
  generatedImages: GeneratedImage[];
  productImages: ProductImage[];
}

export const ResultsGallery: React.FC<ResultsGalleryProps> = ({ generatedImages, productImages }) => {
  const groupedImages = productImages.map(productImage => ({
    ...productImage,
    generated: generatedImages.filter(genImage => genImage.sourceId === productImage.id),
  })).filter(group => group.generated.length > 0);

  return (
    <div className="mt-8">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 text-center">Generated Photos</h2>
      <div className="space-y-12">
        {groupedImages.map(group => (
          <div key={group.id} className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
            <div className="flex items-center mb-4">
              <img src={group.previewUrl} alt="Source product" className="w-16 h-16 object-cover rounded-lg mr-4 border" />
              <div>
                <h3 className="text-lg font-semibold text-slate-700">Source Product</h3>
                <p className="text-sm text-slate-500 truncate max-w-xs">{group.file.name}</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {group.generated.map((image, index) => (
                <div key={`${image.url}-${index}`} className="relative group rounded-lg overflow-hidden shadow-md">
                  <img src={image.url} alt={image.prompt} className="w-full h-full object-cover aspect-square" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all duration-300 flex items-center justify-center">
                    <a
                      href={image.url}
                      download={`generated-image-${group.id}-${index}.png`}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-white bg-primary-600 hover:bg-primary-700 p-3 rounded-full"
                      title="Download Image"
                    >
                      <DownloadIcon className="w-6 h-6" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
