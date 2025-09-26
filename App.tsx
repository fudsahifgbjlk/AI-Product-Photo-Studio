import React, { useState, useCallback } from 'react';
import { Header } from './components/Header';
import { ImageUploader } from './components/ImageUploader';
import { ProductStyleManager } from './components/ProductStyleManager';
import { ResultsGallery } from './components/ResultsGallery';
import { Loader } from './components/Loader';
import type { ProductImage, GeneratedImage, GenerationStyle } from './types';
import { generateStudioPhoto, fileToBase64 } from './services/geminiService';

export default function App() {
  const [productImages, setProductImages] = useState<ProductImage[]>([]);
  const [generationStyles, setGenerationStyles] = useState<GenerationStyle[]>([]);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number }>({ current: 0, total: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (productImages.length === 0) {
      setError("Please upload at least one product.");
      return;
    }
    const hasPhotoSpecs = generationStyles.some(s => s.photoSpecs.length > 0);
    if (!hasPhotoSpecs) {
      setError("Please configure at least one photo generation style.");
      return;
    }

    setError(null);
    setIsGenerating(true);
    setGeneratedImages([]);

    const totalImagesToGenerate = productImages.length * generationStyles.reduce(
        (total, style) => total + style.photoSpecs.length, 0
    );
    setGenerationProgress({ current: 0, total: totalImagesToGenerate });

    const allGeneratedImages: GeneratedImage[] = [];
    let generatedCount = 0;

    for (const productImage of productImages) {
        try {
            const base64Image = await fileToBase64(productImage.file);
            
            for (const style of generationStyles) {
                for (const spec of style.photoSpecs) {
                    const fullPrompt = `${spec.description}, ${style.imageType} product photography style, aspect ratio ${spec.aspectRatio}.`;
                    
                    let success = false;
                    const MAX_RETRIES = 3;
                    let attempt = 0;

                    while (attempt < MAX_RETRIES && !success) {
                        attempt++;
                        try {
                            const generatedUrl = await generateStudioPhoto(base64Image, productImage.file.type, fullPrompt);
                            if (generatedUrl) {
                                allGeneratedImages.push({
                                    sourceId: productImage.id,
                                    sourceUrl: productImage.previewUrl,
                                    url: generatedUrl,
                                    prompt: fullPrompt,
                                });
                                success = true; // Mark as successful to exit the while loop
                            } else {
                                console.warn(`Attempt ${attempt} for prompt "${fullPrompt}" returned no image. Retrying...`);
                                if(attempt < MAX_RETRIES) await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s before retry
                            }
                        } catch (err) {
                            console.error(`Attempt ${attempt} for prompt "${fullPrompt}" failed:`, err);
                            if(attempt < MAX_RETRIES) {
                                await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s before retry
                            } else {
                                setError("An error occurred during image generation. Some images may have failed.");
                            }
                        }
                    }

                    if (!success) {
                        console.error(`Failed to generate image for prompt "${fullPrompt}" after ${MAX_RETRIES} attempts.`);
                    }

                    // Increment progress regardless of success to keep the bar moving.
                    generatedCount++;
                    setGenerationProgress({ current: generatedCount, total: totalImagesToGenerate });
                }
            }
        } catch (err) {
            console.error("Error processing file:", err);
            setError("Could not process one of the uploaded files.");
            // If a file fails to process, we fast-forward the progress bar for all its expected photos
            const photosForThisProduct = generationStyles.reduce((total, style) => total + style.photoSpecs.length, 0);
            generatedCount += photosForThisProduct;
            setGenerationProgress({ current: generatedCount, total: totalImagesToGenerate });
        }
    }

    setGeneratedImages(allGeneratedImages);
    setIsGenerating(false);
    
  }, [productImages, generationStyles]);

  const totalPhotosPerProduct = generationStyles.reduce((sum, style) => sum + style.photoSpecs.length, 0);
  const totalPhotosToGenerate = productImages.length * totalPhotosPerProduct;
  const hasProducts = productImages.length > 0;
  const hasSettings = totalPhotosPerProduct > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <main className="container mx-auto p-4 md:p-8">
        <ImageUploader productImages={productImages} setProductImages={setProductImages} />

        {hasProducts && (
            <>
                <div className="mt-8">
                    <div className="p-6 bg-white rounded-2xl shadow-lg border border-slate-200">
                        <ProductStyleManager
                            generationStyles={generationStyles}
                            setGenerationStyles={setGenerationStyles}
                        />
                    </div>
                </div>

                <div className="mt-8 p-6 bg-white rounded-2xl shadow-lg border border-slate-200 text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Ready to Generate?</h2>
                    <p className="text-slate-600 mb-4">
                        You will generate <span className="font-bold text-primary-600">{totalPhotosPerProduct}</span> photos for each of your <span className="font-bold text-primary-600">{productImages.length}</span> products.
                        Total: <span className="font-bold text-primary-600">{totalPhotosToGenerate}</span> photos.
                    </p>
                    {error && <p className="text-red-500 mb-4">{error}</p>}
                    <button
                        onClick={handleGenerate}
                        disabled={isGenerating || !hasProducts || !hasSettings}
                        className="w-full sm:w-auto px-8 py-3 bg-primary-600 text-white font-semibold rounded-lg shadow-md hover:bg-primary-700 disabled:bg-slate-400 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:scale-100"
                    >
                        {isGenerating ? 'Generating...' : `Generate ${totalPhotosToGenerate} Photos`}
                    </button>
                </div>
            </>
        )}

        {isGenerating && (
          <div className="mt-8">
            <Loader progress={generationProgress} />
          </div>
        )}
        
        {generatedImages.length > 0 && !isGenerating && (
            <ResultsGallery generatedImages={generatedImages} productImages={productImages} />
        )}
      </main>
    </div>
  );
}