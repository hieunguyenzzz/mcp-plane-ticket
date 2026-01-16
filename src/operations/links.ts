import { z } from 'zod';
import { planeRequest } from '../common/utils.js';
import {
  getProjectConfig,
  parseTicketId,
  ProjectIdentifier,
} from '../config/projects.js';
import { PlaneValidationError, PlaneNotFoundError } from '../common/errors.js';

// Schemas
export const ListLinksSchema = z.object({
  ticket_id: z.string().describe('Ticket ID in display format (e.g., SBS-123)'),
});

export const AddLinkSchema = z.object({
  ticket_id: z.string().describe('Ticket ID in display format (e.g., SBS-123)'),
  title: z.string().min(1).describe('Link title (e.g., "Monday: Website Dev #12345")'),
  url: z.string().url().describe('External URL'),
});

// Types
interface PlaneIssue {
  id: string;
  sequence_id: number;
}

interface PlaneLink {
  id: string;
  title: string;
  url: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface PlaneIssueListResponse {
  results?: PlaneIssue[];
}

// Helper to resolve ticket ID to project and issue UUID
async function resolveTicketId(ticketId: string): Promise<{
  project: ProjectIdentifier;
  issueId: string;
  projectId: string;
}> {
  const parsed = parseTicketId(ticketId);
  if (!parsed) {
    throw new PlaneValidationError(
      `Invalid ticket ID format: ${ticketId}. Expected format like SBS-123`
    );
  }

  const projectConfig = getProjectConfig(parsed.project);

  // Fetch issues and filter by sequence_id
  const response = await planeRequest<PlaneIssue[] | PlaneIssueListResponse>(
    `/projects/${projectConfig.id}/issues/`
  );

  const issues = Array.isArray(response) ? response : response.results || [];
  const issue = issues.find((i) => i.sequence_id === parsed.sequenceId);

  if (!issue) {
    throw new PlaneNotFoundError(`Ticket ${ticketId}`);
  }

  return {
    project: parsed.project,
    issueId: issue.id,
    projectId: projectConfig.id,
  };
}

// Operations
export async function listLinks(ticketId: string) {
  const { project, issueId, projectId } = await resolveTicketId(ticketId);

  const links = await planeRequest<PlaneLink[]>(
    `/projects/${projectId}/issues/${issueId}/links/`
  );

  return {
    ticket_id: ticketId,
    links: links.map((link) => ({
      id: link.id,
      title: link.title,
      url: link.url,
      created_at: link.created_at,
      updated_at: link.updated_at,
      created_by: link.created_by,
    })),
    total: links.length,
  };
}

export async function addLink(options: z.infer<typeof AddLinkSchema>) {
  const { project, issueId, projectId } = await resolveTicketId(options.ticket_id);

  const link = await planeRequest<PlaneLink>(
    `/projects/${projectId}/issues/${issueId}/links/`,
    {
      method: 'POST',
      body: {
        title: options.title,
        url: options.url,
      },
    }
  );

  return {
    ticket_id: options.ticket_id,
    link: {
      id: link.id,
      title: link.title,
      url: link.url,
      created_at: link.created_at,
      created_by: link.created_by,
    },
  };
}
