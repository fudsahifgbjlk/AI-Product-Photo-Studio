
import { GoogleGenAI, Modality } from "@google/genai";
import type { Part } from "@google/genai";


export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = (reader.result as string).split(',')[1];
      if (result) {
        resolve(result);
      } else {
        reject(new Error("Failed to convert file to base64"));
      }
    };
    reader.onerror = error => reject(error);
  });
};

export const generateStudioPhoto = async (
  base64Image: string,
  mimeType: string,
  prompt: string
): Promise<string | null> => {
    if (!process.env.API_KEY) {
        throw new Error("API_KEY environment variable not set");
    }
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const imagePart: Part = {
    inlineData: {
      data: base64Image,
      mimeType: mimeType,
    },
  };

  const textPart: Part = { text: prompt };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [imagePart, textPart],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });
  
  for (const part of response.candidates?.[0]?.content?.parts || []) {
    if (part.inlineData) {
      const base64ImageData = part.inlineData.data;
      return `data:${part.inlineData.mimeType};base64,${base64ImageData}`;
    }
  }

  return null;
};
