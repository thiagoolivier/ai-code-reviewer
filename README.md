# AI Code Reviewer

An AI-powered code reviewer for Bitbucket pull requests that uses Google's Gemini API to analyze code changes and provide feedback.

## Features

- Automated code review for Bitbucket pull requests
- AI-powered code analysis using Google's Gemini API
- Automatic comment posting on pull requests
- Bitbucket Pipelines integration

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```

## Environment Variables

- `BITBUCKET_TOKEN`: Your Bitbucket API token
- `GEMINI_API_KEY`: Your Google Gemini API key
- `BITBUCKET_REPO_OWNER`: Repository owner/organization
- `BITBUCKET_REPO_SLUG`: Repository slug
- `BITBUCKET_PR_ID`: Pull request ID

## Development

```bash
# Run in development mode
npm run dev

# Build the project
npm run build

# Run the built project
npm start
```

## Bitbucket Pipelines

The project includes a Bitbucket Pipelines configuration that automatically runs the code review on pull requests. The pipeline will:

1. Install dependencies
2. Build the project
3. Run the code review

## License

ISC 