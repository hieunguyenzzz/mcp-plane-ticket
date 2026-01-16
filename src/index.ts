#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

import * as issues from './operations/issues.js';
import * as comments from './operations/comments.js';
import * as links from './operations/links.js';
import { isPlaneError, formatPlaneError } from './common/errors.js';

const server = new Server(
  {
    name: 'plane-mcp-server',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List all available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'plane_list_issues',
        description:
          'List issues in a Plane project with optional filters for state and priority. Returns issues with display ticket IDs (e.g., SBS-123).',
        inputSchema: zodToJsonSchema(issues.ListIssuesSchema),
      },
      {
        name: 'plane_get_issue',
        description:
          'Get a single issue by its ticket ID (e.g., SBS-123, MOB-45). Returns full issue details.',
        inputSchema: zodToJsonSchema(issues.GetIssueSchema),
      },
      {
        name: 'plane_create_issue',
        description:
          'Create a new issue in a Plane project. Accepts state names (e.g., "In Progress") instead of UUIDs.',
        inputSchema: zodToJsonSchema(issues.CreateIssueSchema),
      },
      {
        name: 'plane_update_issue',
        description:
          'Update an existing issue. Can change state, priority, title, description, etc. Accepts state names.',
        inputSchema: zodToJsonSchema(issues.UpdateIssueSchema),
      },
      {
        name: 'plane_delete_issue',
        description: 'Delete an issue by its ticket ID.',
        inputSchema: zodToJsonSchema(issues.DeleteIssueSchema),
      },
      {
        name: 'plane_list_comments',
        description: 'List all comments on an issue.',
        inputSchema: zodToJsonSchema(comments.ListCommentsSchema),
      },
      {
        name: 'plane_add_comment',
        description: 'Add a comment to an issue. Comment should be in HTML format.',
        inputSchema: zodToJsonSchema(comments.AddCommentSchema),
      },
      {
        name: 'plane_list_links',
        description: 'List external links attached to an issue (e.g., Monday.com associations).',
        inputSchema: zodToJsonSchema(links.ListLinksSchema),
      },
      {
        name: 'plane_add_link',
        description:
          'Add an external link to an issue. Useful for associating Monday.com tickets.',
        inputSchema: zodToJsonSchema(links.AddLinkSchema),
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  try {
    if (!request.params.arguments) {
      throw new Error('Arguments are required');
    }

    switch (request.params.name) {
      case 'plane_list_issues': {
        const args = issues.ListIssuesSchema.parse(request.params.arguments);
        const result = await issues.listIssues(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'plane_get_issue': {
        const args = issues.GetIssueSchema.parse(request.params.arguments);
        const result = await issues.getIssue(args.ticket_id);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'plane_create_issue': {
        const args = issues.CreateIssueSchema.parse(request.params.arguments);
        const result = await issues.createIssue(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'plane_update_issue': {
        const args = issues.UpdateIssueSchema.parse(request.params.arguments);
        const result = await issues.updateIssue(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'plane_delete_issue': {
        const args = issues.DeleteIssueSchema.parse(request.params.arguments);
        const result = await issues.deleteIssue(args.ticket_id);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'plane_list_comments': {
        const args = comments.ListCommentsSchema.parse(request.params.arguments);
        const result = await comments.listComments(args.ticket_id);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'plane_add_comment': {
        const args = comments.AddCommentSchema.parse(request.params.arguments);
        const result = await comments.addComment(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'plane_list_links': {
        const args = links.ListLinksSchema.parse(request.params.arguments);
        const result = await links.listLinks(args.ticket_id);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      case 'plane_add_link': {
        const args = links.AddLinkSchema.parse(request.params.arguments);
        const result = await links.addLink(args);
        return {
          content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
        };
      }

      default:
        throw new Error(`Unknown tool: ${request.params.name}`);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        content: [
          {
            type: 'text',
            text: `Invalid input: ${JSON.stringify(error.errors, null, 2)}`,
          },
        ],
        isError: true,
      };
    }
    if (isPlaneError(error)) {
      return {
        content: [{ type: 'text', text: formatPlaneError(error) }],
        isError: true,
      };
    }
    const message = error instanceof Error ? error.message : String(error);
    return {
      content: [{ type: 'text', text: `Error: ${message}` }],
      isError: true,
    };
  }
});

async function runServer() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Plane MCP Server running on stdio');
}

runServer().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
