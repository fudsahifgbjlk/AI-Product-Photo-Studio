export interface ProductImage {
  id: string;
  file: File;
  previewUrl: string;
}

export interface PhotoSpec {
  id: string;
  description: string;
  aspectRatio: '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
}

export interface GenerationStyle {
  id: string;
  name: string;
  imageType: string; // e.g., 'Studio', 'Lifestyle', 'Flat Lay'
  photoSpecs: PhotoSpec[];
}

export interface GeneratedImage {
  sourceId: string;
  sourceUrl: string;
  url: string;
  prompt: string;
}