
import { GoogleGenAI, Type } from "@google/genai";

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  }

  async parseChord(chordName: string): Promise<string[]> {
    if (!chordName) return [];
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Given the chord name "${chordName}", identify the musical notes that comprise it. Return only the note names (e.g., C, Eb, G, Bb) as a JSON array.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              notes: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });
      
      const data = JSON.parse(response.text || '{"notes":[]}');
      return data.notes;
    } catch (error) {
      console.error("Chord Parse Error:", error);
      return [];
    }
  }

  async suggestMelody(mood: string): Promise<string[]> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `I want to play the piano. The mood is ${mood}. Based on a standard keyboard mapping where notes are C3 to E5, suggest a short sequence of 8 notes to play. Return ONLY the note names like C4, D4, E4 etc. in a JSON array.`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              melody: {
                type: Type.ARRAY,
                items: { type: Type.STRING }
              }
            }
          }
        }
      });
      
      const data = JSON.parse(response.text || '{"melody":[]}');
      return data.melody;
    } catch (error) {
      console.error("AI Error:", error);
      return [];
    }
  }

  async describePerformance(notes: string[]): Promise<string> {
    if (notes.length === 0) return "Play some notes first!";
    
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `A user just played these notes on a piano: ${notes.join(', ')}. Provide a poetic, short (1-2 sentence) description of the vibe or sound of this sequence.`,
      });
      return response.text || "A beautiful melody.";
    } catch (error) {
      return "The notes resonate with mystery.";
    }
  }
}

export const geminiService = new GeminiService();
