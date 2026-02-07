
import { GoogleGenAI, Type } from "@google/genai";

// Initialize the GoogleGenAI client according to strict guidelines
const getAIClient = () => {
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export const generateListingDetails = async (title: string, category: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Generate a compelling marketplace listing description for ${title} under the category ${category}. Focus on freshness, quality, and farming methods. Also suggest a competitive price range per kg.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          description: { type: Type.STRING },
          suggestedPriceRange: { type: Type.STRING },
          marketingKeywords: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["description", "suggestedPriceRange"]
      }
    }
  });
  
  return JSON.parse(response.text || '{}');
};

// Fixed: Using gemini-3-pro-preview for complex reasoning task as per guidelines
export const getPriceIntelligence = async (listingTitle: string, price: number, location: string, incomeLevel: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Analyze the market value for "${listingTitle}" priced at ₦${price.toLocaleString()} in ${location}. 
    The target buyer has a "${incomeLevel}" income level. 
    Provide intelligence on purchasing power, fair market price, and selling strategy.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          fairPrice: { type: Type.NUMBER },
          purchasingPowerScore: { type: Type.NUMBER, description: "Score from 1 to 10" },
          locationContext: { type: Type.STRING },
          strategyAdvice: { type: Type.STRING },
          competitorPriceRange: { type: Type.STRING }
        },
        required: ["fairPrice", "purchasingPowerScore", "strategyAdvice"]
      }
    }
  });
  
  return JSON.parse(response.text || '{}');
};

export const getMarketAdvice = async (query: string) => {
  const ai = getAIClient();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are an expert agricultural market advisor. Answer the following farmer query: "${query}". Provide specific, actionable advice about crop timing, pricing trends, or pest management.`,
  });
  
  return response.text;
};
