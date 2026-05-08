import { z } from 'zod';
import { planeRequest } from '../common/utils.js';
import {
  getProjectConfig,
  getProjectInstance,
  parseTicketId,
  formatTicketId,
  ProjectIdentifier,
} from '../config/projects.js';
import { PlaneValidationError, PlaneNotFoundError } from '../common/errors.js';

// Schemas
export const ListCommentsSchema = z.object({
  ticket_id: z.string().describe('Ticket ID in display format (e.g., SBS-123)'),
});

export const AddCommentSchema = z.object({
  ticket_id: z.string().describe('Ticket ID in display format (e.g., SBS-123)'),
  comment_html: z.string().min(1).describe('Comment content in HTML format'),
});

export const DeleteCommentSchema = z.object({
  ticket_id: z.string().describe('Ticket ID in display format (e.g., SBS-123)'),
  comment_id: z.string().describe('Comment UUID (from plane_list_comments)'),
});

// Types
interface PlaneIssue {
  id: string;
  sequence_id: number;
}

interface PlaneComment {
  id: string;
  comment_html: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  actor: string;
}

interface PlaneIssueListResponse {
  results?: PlaneIssue[];
}

interface PlaneCommentListResponse {
  results?: PlaneComment[];
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
  const instance = getProjectInstance(parsed.project);

  // Fetch issues and filter by sequence_id
  const response = await planeRequest<PlaneIssue[] | PlaneIssueListResponse>(
    `/projects/${projectConfig.id}/issues/`,
    {},
    instance,
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
export async function listComments(ticketId: string) {
  const { project, issueId, projectId } = await resolveTicketId(ticketId);

  const response = await planeRequest<PlaneComment[] | PlaneCommentListResponse>(
    `/projects/${projectId}/issues/${issueId}/comments/`,
    {},
    getProjectInstance(project),
  );

  // Handle both array and paginated object responses
  const comments = Array.isArray(response) ? response : response.results || [];

  return {
    ticket_id: ticketId,
    comments: comments.map((comment) => ({
      id: comment.id,
      comment_html: comment.comment_html,
      created_at: comment.created_at,
      updated_at: comment.updated_at,
      created_by: comment.created_by,
      actor: comment.actor,
    })),
    total: comments.length,
  };
}

export async function addComment(options: z.infer<typeof AddCommentSchema>) {
  const { project, issueId, projectId } = await resolveTicketId(options.ticket_id);

  await planeRequest<PlaneComment>(
    `/projects/${projectId}/issues/${issueId}/comments/`,
    {
      method: 'POST',
      body: {
        comment_html: options.comment_html,
      },
    },
    getProjectInstance(project),
  );

  return { status: 'done' };
}

export async function deleteComment(options: z.infer<typeof DeleteCommentSchema>) {
  const { project, issueId, projectId } = await resolveTicketId(options.ticket_id);

  await planeRequest(
    `/projects/${projectId}/issues/${issueId}/comments/${options.comment_id}/`,
    { method: 'DELETE' },
    getProjectInstance(project),
  );

  return { status: 'done' };
}
