import axios from 'axios';
import { Logger } from '../utils/logger';

/**
 * Fetches the diff for a pull request from Bitbucket
 */
export async function getPullRequestDiff(
  token: string,
  owner: string,
  repoSlug: string,
  prId: string
): Promise<string> {
  try {
    Logger.info(`Fetching diff for PR ${prId}`);
    
    const url = `https://api.bitbucket.org/2.0/repositories/${owner}/${repoSlug}/pullrequests/${prId}/diff`;
    
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'text/plain',
      },
    });

    if (!response.data) {
      throw new Error('No diff content received from Bitbucket');
    }

    Logger.info(`Successfully fetched diff for PR ${prId}`);
    return response.data;
  } catch (error) {
    Logger.error('Error fetching PR diff', error as Error);
    throw error;
  }
} 