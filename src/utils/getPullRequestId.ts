import axios from "axios";
import { Logger } from "./logger";

interface PullRequest {
  id: string;
  title: string;
  source: {
    commit: {
      hash: string;
    };
  };
}

interface BitbucketResponse {
  values: PullRequest[];
}

export async function getPullRequestId(
  repoOwner: string,
  repoSlug: string,
  commitHash: string,
  bitbucketToken: string
): Promise<string | null> {
  try {
    const url = `https://api.bitbucket.org/2.0/repositories/${repoOwner}/${repoSlug}/pullrequests?q=source.commit.hash="${commitHash}"`;
    
    Logger.info(`Fetching PR ID for commit ${commitHash}`);
    
    const response = await axios.get<BitbucketResponse>(url, {
      headers: {
        Authorization: `Bearer ${bitbucketToken}`,
      },
    });

    const pr = response.data.values?.[0];
    
    if (!pr) {
      Logger.warn(`No PR found for commit ${commitHash}`);
      return null;
    }

    Logger.info(`Found PR #${pr.id} for commit ${commitHash}`);
    return pr.id;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    Logger.error(`Failed to fetch PR ID: ${errorMessage}`);
    throw error;
  }
}
