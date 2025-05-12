/**
 * Types for Bitbucket API and webhook payloads
 */

export interface BitbucketLinks {
  self: { href: string };
  html: { href: string };
  avatar?: { href: string };
}

export interface BitbucketUser {
  display_name: string;
  links: BitbucketLinks;
  type: string;
  uuid: string;
  username: string;
}

export interface BitbucketRepository {
  type: string;
  full_name: string;
  name: string;
  owner: BitbucketUser;
  uuid: string;
}

export interface BitbucketPullRequest {
  id: number;
  title: string;
  description: string;
  state: string;
  author: BitbucketUser;
  source: {
    branch: {
      name: string;
    };
    repository: BitbucketRepository;
  };
  destination: {
    branch: {
      name: string;
    };
    repository: BitbucketRepository;
  };
  links: {
    diff: { href: string };
  };
}

export interface BitbucketWebhookPayload {
  repository: BitbucketRepository;
  actor: BitbucketUser;
  pullrequest: BitbucketPullRequest;
} 