# Architecture

## Overview

Plane MCP Server provides Model Context Protocol tools for interacting with Plane project management. It supports two transport modes:

- **stdio** - Local process communication (default)
- **HTTP** - Remote server via Streamable HTTP transport

## Cloud Run Deployment

The server is deployed to Google Cloud Run for remote access.

### Service Details

| Property | Value |
|----------|-------|
| URL | https://plane-mcp-server-1008501784095.us-central1.run.app |
| MCP Endpoint | /mcp |
| Health Check | /health |
| Region | us-central1 |
| Project | poised-diagram-475802-d8 |

### Resource Configuration

- Memory: 256Mi
- CPU: 1
- Min instances: 0 (scales to zero)
- Max instances: 1

### Environment Variables

| Variable | Description |
|----------|-------------|
| `USE_HTTP` | Set to `true` for HTTP mode |
| `PORT` | Server port (default: 8080) |
| `PLANE_API_KEY` | Plane API authentication key |

## Local Development

```bash
# Build
npm run build

# Run locally (stdio mode)
npm start

# Run locally (HTTP mode)
USE_HTTP=true PORT=8080 npm start
```

## Docker

```bash
# Build image
docker build -t plane-mcp-server .

# Run container
docker run -p 8080:8080 \
  -e PLANE_API_KEY=your_key \
  plane-mcp-server
```

## Deployment

### Deploy to Cloud Run

```bash
# Build and push to GCR
docker build -t plane-mcp-server:latest .
docker tag plane-mcp-server:latest gcr.io/poised-diagram-475802-d8/plane-mcp-server:latest
docker push gcr.io/poised-diagram-475802-d8/plane-mcp-server:latest

# Quick deploy (update existing service)
gcloud run services update plane-mcp-server \
  --image gcr.io/poised-diagram-475802-d8/plane-mcp-server:latest \
  --region us-central1 --project poised-diagram-475802-d8 --quiet

# Full deploy (first time or config changes)
gcloud run deploy plane-mcp-server \
  --image gcr.io/poised-diagram-475802-d8/plane-mcp-server:latest \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --memory 256Mi \
  --cpu 1 \
  --min-instances 0 \
  --max-instances 1 \
  --set-env-vars "PLANE_API_KEY=your_key" \
  --project poised-diagram-475802-d8
```

## Claude Code Configuration

### Add Remote MCP

```bash
claude mcp add plane-remote --transport http https://plane-mcp-server-1008501784095.us-central1.run.app/mcp
```

### Verify Connection

```bash
claude mcp list | grep plane
```

## Project Structure

```
plane/
├── src/
│   ├── index.ts          # Server entry (stdio + HTTP)
│   ├── common/
│   │   └── errors.ts     # Error handling
│   ├── config/
│   │   └── projects.ts   # Project configuration
│   └── operations/
│       ├── issues.ts     # Issue CRUD operations
│       ├── comments.ts   # Comment operations
│       └── links.ts      # Link operations
├── Dockerfile
├── package.json
└── tsconfig.json
```
