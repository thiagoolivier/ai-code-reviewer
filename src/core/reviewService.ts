import { AiClient } from '../api/geminiClient';
import { BitbucketClient } from '../bitbucket/bitbucketClient';
import { Logger } from '../utils/logger';

/**
 * Service that coordinates the code review process
 */
export class ReviewService {
  constructor(
    private aiClient: AiClient,
    private bitbucketClient: BitbucketClient
  ) {}

  async reviewPullRequest(prId: string, diff: string): Promise<void> {
    try {
      Logger.info('Starting code review process');
      
      // Analyze code using AI
      const analysis = await this.aiClient.analyzeCode(diff);
      
      // Post analysis as comment
      await this.bitbucketClient.postComment(prId, analysis);
      
      Logger.info('Code review completed successfully');
    } catch (error) {
      Logger.error('Error during code review process', error as Error);
      throw error;
    }
  }
} 