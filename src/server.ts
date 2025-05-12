import express, { Request, Response, Router, NextFunction } from 'express';
import dotenv from 'dotenv';
import { GeminiClient } from './api/geminiClient';
import { BitbucketClient } from './bitbucket/bitbucketClient';
import { ReviewService } from './core/reviewService';
import { Logger } from './utils/logger';
import { getPullRequestDiff } from './bitbucket/getPullRequestDiff';
import crypto from 'crypto';
import { BitbucketWebhookPayload } from './types/bitbucket';

// Load environment variables
dotenv.config();

// Only import ngrok in development
let ngrok: typeof import('ngrok');
if (process.env.NODE_ENV !== 'production') {
  ngrok = require('ngrok');
}

// Validate required environment variables
const requiredEnvVars = [
  'BITBUCKET_TOKEN',
  'GEMINI_API_KEY',
  'BITBUCKET_REPO_OWNER',
  'BITBUCKET_REPO_SLUG',
];

// Only require NGROK_AUTH_TOKEN in development
if (process.env.NODE_ENV !== 'production') {
  requiredEnvVars.push('NGROK_AUTH_TOKEN');
}

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`Missing required environment variable: ${envVar}`);
  }
}

const app = express();
const router = Router();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Initialize clients
const geminiClient = new GeminiClient(process.env.GEMINI_API_KEY!);
const bitbucketClient = new BitbucketClient(
  process.env.BITBUCKET_TOKEN!,
  process.env.BITBUCKET_REPO_OWNER!,
  process.env.BITBUCKET_REPO_SLUG!
);

// Initialize review service
const reviewService = new ReviewService(geminiClient, bitbucketClient);

// Verify webhook signature
function verifyWebhookSignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac('sha256', secret);
  const calculatedSignature = `sha256=${hmac.update(payload).digest('hex')}`;
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(calculatedSignature)
  );
}

// Health check endpoint
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

// Webhook endpoint for Bitbucket PR events
const webhookHandler: express.RequestHandler = async (req, res, next) => {
  try {
    const event = req.headers['x-event-key'];
    const payload = JSON.stringify(req.body);

    // Verify webhook signature if configured
    if (process.env.BITBUCKET_WEBHOOK_SECRET) {
      const signature = req.headers['x-hub-signature'];
      if (!signature || typeof signature !== 'string') {
        res.status(401).json({ error: 'Missing or invalid webhook signature' });
        return;
      }

      if (!verifyWebhookSignature(payload, signature, process.env.BITBUCKET_WEBHOOK_SECRET)) {
        res.status(401).json({ error: 'Invalid webhook signature' });
        return;
      }
    }

    // Handle PR events
    if (event === 'pullrequest:created' || event === 'pullrequest:updated') {
      const body = req.body as BitbucketWebhookPayload;
      
      if (!body?.pullrequest?.id || !body?.repository?.owner?.username || !body?.repository?.name) {
        Logger.error(`Invalid webhook payload: ${JSON.stringify(body, null, 2)}`);
        res.status(400).json({ error: 'Invalid payload structure' });
        return;
      }

      const prId = body.pullrequest.id.toString();
      const repoOwner = body.repository.owner.username;
      const repoSlug = body.repository.name;

      // Get PR diff
      const diff = await getPullRequestDiff(
        process.env.BITBUCKET_TOKEN!,
        repoOwner,
        repoSlug,
        prId
      );

      // Review the PR
      await reviewService.reviewPullRequest(prId, diff);

      res.status(200).json({ message: 'PR review completed' });
      return;
    }

    res.status(200).json({ message: 'Event not handled' });
  } catch (error) {
    next(error);
  }
};

router.post('/webhook/bitbucket', webhookHandler);

// Error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  Logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Mount the router
app.use('/', router);

// Start server and ngrok
async function startServer() {
  try {
    let webhookUrl = `http://localhost:${PORT}`;

    // Start ngrok only in development
    if (process.env.NODE_ENV !== 'production') {
      const url = await ngrok.connect({
        addr: PORT,
        authtoken: process.env.NGROK_AUTH_TOKEN,
      });
      
      Logger.info(`ngrok tunnel established at: ${url}`);
      webhookUrl = url;
    }

    Logger.info(`Webhook URL: ${webhookUrl}/webhook/bitbucket`);

    // Start server
    app.listen(PORT, () => {
      Logger.info(`Server running on port ${PORT}`);
    });
  } catch (error) {
    Logger.error('Failed to start server:', error as Error);
    process.exit(1);
  }
}

startServer(); 