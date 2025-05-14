import { GoogleGenAI } from "@google/genai";
import { Logger } from "../utils/logger";
import { AiClientInterface } from "../interfaces/iAiClient";

/**
 * Implementation of AiClient using Google's Gemini API
 */
export class GeminiClient implements AiClientInterface {
  private ai: GoogleGenAI;

  constructor(apiKey: string) {
    this.ai = new GoogleGenAI({ apiKey });
  }

  async analyzeCode(diff: string): Promise<string> {
    try {
      Logger.info("Analyzing code with Gemini");

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
                  You are an AI code review assistant. 
                  Your task is to analyze pull request diffs from Bitbucket and provide clear, helpful, and constructive feedback to developers.

                  Goal of the Review:
                  - Identify issues related to readability, best practices, potential bugs, and code consistency.
                  - Suggest improvements for style, structure, or maintainability.
                  - Ensure the code follows good development practices, architecture standards, security, and performance guidelines.

                  General Guidelines:
                  - Review only the diff. the added, modified, or removed lines.
                  - Avoid commenting on code outside the diff, unless strictly necessary for context.
                  - Be concise, objective, and constructive.
                  - For each issue found, explain why it is a problem and suggest a fix.
                  - Positive feedback is welcome. you may praise improvements or good practices briefly.

                  For each issue found, explain why it is a problem and suggest a fix.

                  Positive feedback is welcome. You may praise improvements or good practices briefly.

                  Focus Areas:
                  - Obvious bugs or logic issues
                  - Repeated or duplicated code
                  - Variable and function naming
                  - Function size and responsibility
                  - Violations of separation of concerns (e.g. SRP)
                  - Performance (e.g. nested loops, poor data structures)
                  - Security and input validation
                  - Style consistency with the rest of the codebase (if visible)
                  
                  Diff to analyze:
                  ---
                  ${diff}
                  ---
                `,
              },
            ],
          },
        ],
        config: {
          systemInstruction:
            "You are an AI code review assistant. Your task is to analyze pull request diffs from Bitbucket and provide clear, helpful, and constructive feedback to developers.",
          maxOutputTokens: 500,
          temperature: 0.5,
        },
      });

      if (!response.text) {
        throw new Error("No response from Gemini");
      }

      return response.text;
    } catch (error) {
      Logger.error("Error analyzing code with Gemini", error as Error);
      throw error;
    }
  }
}
