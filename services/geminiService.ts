
import { GoogleGenAI, Type } from "@google/genai";
import { ViralAnalysis } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeTikTokContent = async (videoUrl: string): Promise<ViralAnalysis> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Perform a simulation analysis for this TikTok video URL: ${videoUrl}. 
      Give a viral potential score (0-100), 3 specific content optimization tips to boost organic growth, and an estimated reach if boosted. 
      Return the data strictly as JSON.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER },
            recommendations: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            estimatedReach: { type: Type.STRING }
          },
          required: ["score", "recommendations", "estimatedReach"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    return {
      score: result.score || 0,
      recommendations: result.recommendations || [],
      estimatedReach: result.estimatedReach || "Unknown"
    };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      score: 0,
      recommendations: ["Ensure high lighting", "Use trending sounds", "Post at peak hours"],
      estimatedReach: "N/A"
    };
  }
};
