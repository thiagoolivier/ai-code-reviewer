# AI Code Reviewer

An AI-powered code reviewer for Bitbucket pull requests that uses Google's Gemini API to analyze code changes and provide feedback automatically through webhooks.

## Features

- Automated code review for Bitbucket pull requests
- Webhook-based integration with Bitbucket
- AI-powered code analysis using Google's Gemini API
- Automatic comment posting on pull requests
- Secure webhook signature verification
- Development mode with ngrok tunneling

## Quick Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd ai-code-reviewer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file with the following variables:
   ```env
   # Bitbucket Configuration
   BITBUCKET_TOKEN=your_bitbucket_token
   BITBUCKET_REPO_OWNER=your_repo_owner
   BITBUCKET_REPO_SLUG=your_repo_slug
   BITBUCKET_WEBHOOK_SECRET=your_webhook_secret

   # Google Gemini API
   GEMINI_API_KEY=your_gemini_api_key

   # Environment Configuration
   NODE_ENV=development  # or 'production'

   # Ngrok Configuration (only required in development)
   NGROK_AUTH_TOKEN=your_ngrok_token

   # Optional: Server Configuration
   PORT=3000
   ```

4. Start the server:
   ```bash
   # Development (with ngrok)
   NODE_ENV=development npm run dev

   # Production (without ngrok)
   NODE_ENV=production npm run build
   NODE_ENV=production npm start
   ```

5. Set up Bitbucket Webhook:
   - Go to your Bitbucket repository settings
   - Navigate to "Webhooks"
   - Click "Add webhook"
   - Set the URL to your webhook URL:
     - Development: `https://your-ngrok-url.ngrok.io/webhook/bitbucket`
     - Production: `https://your-production-domain.com/webhook/bitbucket`
   - Set the events to trigger on:
     - Pull Request: Created
     - Pull Request: Updated
   - Add the same secret key you set in `BITBUCKET_WEBHOOK_SECRET`

## How It Works

1. When a pull request is created or updated, Bitbucket sends a webhook to your server
2. The server verifies the webhook signature for security
3. The code changes are analyzed using Google's Gemini AI
4. The analysis is automatically posted as a comment on the pull request

## Development

The server includes:
- Health check endpoint at `/health`
- Webhook endpoint at `/webhook/bitbucket`
- Automatic ngrok tunnel creation in development mode
- Error handling and logging

## Environment Variables

| Variable | Description | Required | Environment |
|----------|-------------|----------|-------------|
| `BITBUCKET_TOKEN` | Bitbucket API token | Yes | All |
| `BITBUCKET_REPO_OWNER` | Repository owner/organization | Yes | All |
| `BITBUCKET_REPO_SLUG` | Repository slug | Yes | All |
| `BITBUCKET_WEBHOOK_SECRET` | Secret for webhook signature verification | Yes | All |
| `GEMINI_API_KEY` | Google Gemini API key | Yes | All |
| `NODE_ENV` | Environment mode ('development' or 'production') | Yes | All |
| `NGROK_AUTH_TOKEN` | Ngrok authentication token | Yes | Development only |
| `PORT` | Server port (default: 3000) | No | All |

## License

ISC 