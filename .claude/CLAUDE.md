# Plane MCP Server

MCP server for Plane project management.

## Development Workflow

After making changes to the MCP server:

1. **Build locally** to verify TypeScript compiles:
   ```bash
   npm run build
   ```

2. **Deploy to Cloud Run** (see commands below)

3. **Ask user to reload Claude Code** to pick up updated tools:
   > "Changes deployed. Please run `/restart mcp` or restart Claude Code to test the updated MCP server."

## Deploy to Cloud Run

```bash
# Build and push
docker build -t plane-mcp-server:latest .
docker tag plane-mcp-server:latest gcr.io/poised-diagram-475802-d8/plane-mcp-server:latest
export PATH="$PATH:/home/hieunguyen/google-cloud-sdk/bin"
docker push gcr.io/poised-diagram-475802-d8/plane-mcp-server:latest

# Deploy (updates existing service, creates new revision)
gcloud run services update plane-mcp-server \
  --image gcr.io/poised-diagram-475802-d8/plane-mcp-server:latest \
  --region us-central1 --project poised-diagram-475802-d8 --quiet

# Verify
curl https://plane-mcp-server-1008501784095.us-central1.run.app/health
```

## Architecture

See [ARCHITECTURE.md](../ARCHITECTURE.md) for full deployment details, configuration, and project structure.

## Rules

- @.claude/rules/git.md - Git workflow
