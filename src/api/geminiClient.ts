import { GoogleGenAI } from '@google/genai';
import { Logger } from '../utils/logger';

/**
 * Interface for AI code analysis clients
 */
export interface AiClient {
  analyzeCode(diff: string): Promise<string>;
}

/**
 * Implementation of AiClient using Google's Gemini API
 */
export class GeminiClient implements AiClient {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeCode(diff: string): Promise<string> {
    try {
      Logger.info('Analyzing code with Gemini');

      // Check if diff is empty or just whitespace
      if (!diff || diff.trim().length === 0) {
        return "No changes to analyze in this diff.";
      }

      const response = await this.ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `
                  You are a senior software engineer reviewing a pull request. 
                  Analyze the following diff and provide ONLY your findings and recommendations.
                  Try to be friendly while being direct and concise. If there's nothing significant to comment on, just say so.
                  Answer in brazilian portuguese.
                  
                  Format your response as a bullet list of findings.
                  Each finding should be clear and actionable.
                  Do not include explanations about your role or process.
                  
                  Diff to analyze:
                  ---
                  ${diff}
                  ---
                `
              }
            ]
          }
        ],
        config: {
          systemInstruction: "You are a direct and concise code reviewer. Provide only actionable feedback in bullet points.",
          maxOutputTokens: 500,
          temperature: 0.5,
        },
      });

      if (!response.text) {
        throw new Error('No response from Gemini');
      }

      return response.text;
    } catch (error) {
      Logger.error('Error analyzing code with Gemini', error as Error);
      throw error;
    }
  }
} 