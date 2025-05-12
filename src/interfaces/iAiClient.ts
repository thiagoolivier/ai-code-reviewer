/**
 * Interface for AI code analysis clients
 */
export interface AiClientInterface {
    analyzeCode(diff: string): Promise<string>;
}