# Plane MCP Server

A Model Context Protocol (MCP) server that exposes [Plane](https://plane.so) project management tools to Claude Code and other MCP-compatible AI assistants.

## Features

- **9 tools** for complete ticket management
- **User-friendly identifiers** - Use `SBS-123` instead of UUIDs
- **State name resolution** - Pass `"In Progress"` instead of state UUIDs
- **Multi-project support** - SBS, MOB, DE, OMNI, MWP, QUELL
- **Validation with helpful errors** - Shows valid options when input is invalid

## Tools

| Tool | Description |
|------|-------------|
| `plane_list_issues` | List issues with filters (project, state, priority) |
| `plane_get_issue` | Get single issue by ticket ID (e.g., SBS-123) |
| `plane_create_issue` | Create new issue |
| `plane_update_issue` | Update issue (state, priority, title, etc.) |
| `plane_delete_issue` | Delete issue |
| `plane_list_comments` | List all comments on an issue |
| `plane_add_comment` | Add comment to an issue |
| `plane_list_links` | List external links on an issue |
| `plane_add_link` | Add external link (e.g., Monday.com) |

## Installation

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
# Clone the repository
git clone git@github.com:hieunguyenzzz/mcp-plane-ticket.git
cd mcp-plane-ticket

# Install dependencies
npm install

# Build
npm run build
```

### Register with Claude Code

Add to your `~/.claude.json`:

```json
{
  "mcpServers": {
    "plane": {
      "command": "node",
      "args": ["/path/to/mcp-plane-ticket/dist/index.js"],
      "env": {
        "PLANE_API_KEY": "your-plane-api-key"
      }
    }
  }
}
```

Restart Claude Code to load the MCP server.

## Usage Examples

### List Issues

```
mcp__plane__plane_list_issues(project: "SBS", state: "In Progress", limit: 10)
```

### Get Issue

```
mcp__plane__plane_get_issue(ticket_id: "SBS-123")
```

### Create Issue

```
mcp__plane__plane_create_issue(
  project: "MOB",
  name: "Fix login bug",
  description_html: "<p>Description here</p>",
  priority: "high",
  state: "Todo"
)
```

### Update Issue

```
mcp__plane__plane_update_issue(
  ticket_id: "SBS-123",
  state: "Done"
)
```

### Add Comment

```
mcp__plane__plane_add_comment(
  ticket_id: "SBS-123",
  comment_html: "<p>This is fixed now</p>"
)
```

### Add External Link

```
mcp__plane__plane_add_link(
  ticket_id: "SBS-123",
  title: "Monday: Task #12345",
  url: "https://monday.com/boards/123/pulses/12345"
)
```

## Configuration

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PLANE_API_KEY` | Yes | Your Plane API key |

### Supported Projects

| Project | Identifier | States |
|---------|------------|--------|
| soundboxstore.com | SBS | Backlog → Todo → In Progress → PR Submitted → Live Testing → Done |
| mobelaris.com | MOB | Backlog → Todo → In Progress → PR Submitted → Staging Testing → Live Testing → Done |
| designereditions.com | DE | Backlog → Todo → In Progress → PR Submitted → PR Reviewing → Staging Testing → Live Testing → Done |
| omni.com | OMNI | Backlog → Todo → In Progress → PR Submitted → Done |
| merakiweddingplanner.com | MWP | Backlog → Todo → In Progress → PR Submitted → Done |
| quelldesign.com | QUELL | Backlog → Todo → In Progress → PR Submitted → PR Review → Testing on Live → Done |

### Priority Values

- `none` - No priority
- `low` - Low priority
- `medium` - Medium priority
- `high` - High priority
- `urgent` - Urgent priority

## Development

### Project Structure

```
src/
├── index.ts              # Main MCP server entry point
├── config/
│   └── projects.ts       # Project IDs, state mappings, helpers
├── common/
│   ├── errors.ts         # Custom error classes
│   └── utils.ts          # HTTP request utilities
└── operations/
    ├── issues.ts         # Issue CRUD operations
    ├── comments.ts       # Comment operations
    └── links.ts          # External link operations
```

### Building

```bash
npm run build
```

### Testing

```bash
# Test tools/list
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | \
  PLANE_API_KEY="your-key" node dist/index.js

# Test a tool call
echo '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"plane_list_issues","arguments":{"project":"SBS","limit":5}}}' | \
  PLANE_API_KEY="your-key" node dist/index.js
```

## Architecture

This MCP server follows the official [Model Context Protocol](https://modelcontextprotocol.io/) specification:

- **Transport**: stdio (standard input/output)
- **SDK**: `@modelcontextprotocol/sdk`
- **Validation**: Zod schemas with `zod-to-json-schema`

### Key Design Decisions

1. **User-friendly identifiers**: Accept `SBS-123` format, resolve to UUIDs internally
2. **State name resolution**: Accept `"In Progress"`, map to state UUIDs per project
3. **Helpful validation errors**: Show valid options when input doesn't match
4. **Formatted responses**: Return readable state names alongside UUIDs

## License

MIT
