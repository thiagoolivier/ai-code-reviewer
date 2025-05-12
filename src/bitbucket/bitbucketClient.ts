import axios from 'axios';
import { Logger } from '../utils/logger';

/**
 * Client for interacting with Bitbucket API
 */
export class BitbucketClient {
  private baseUrl: string;
  private token: string;

  constructor(token: string, owner: string, repoSlug: string) {
    this.token = token;
    this.baseUrl = `https://api.bitbucket.org/2.0/repositories/${owner}/${repoSlug}`;
  }

  private getHeaders() {
    return {
      Authorization: `Bearer ${this.token}`,
      'Content-Type': 'application/json',
    };
  }

  private validateAuth(): void {
    if (!this.token) {
      throw new Error('Bitbucket token is required');
    }
  }

  async validateRepositoryAccess(): Promise<boolean> {
    try {
      this.validateAuth();
      await axios.get(this.baseUrl, {
        headers: this.getHeaders()
      });
      return true;
    } catch (error) {
      this.handleAuthError(error);
      return false;
    }
  }

  private handleAuthError(error: any): never {
    if (error.response?.status === 401) {
      throw new Error('Invalid Bitbucket token or insufficient permissions');
    }
    if (error.response?.status === 403) {
      throw new Error('Repository access denied. Check token permissions');
    }
    throw error;
  }

  async postComment(prId: string, comment: string): Promise<void> {
    try {
      this.validateAuth();
      const url = `${this.baseUrl}/pullrequests/${prId}/comments`;
      
      await axios.post(url, {
        content: {
          raw: comment
        }
      }, {
        headers: this.getHeaders()
      });
      
      Logger.info(`Successfully posted comment to PR ${prId}`);
    } catch (error) {
      this.handleAuthError(error);
    }
  }
} 