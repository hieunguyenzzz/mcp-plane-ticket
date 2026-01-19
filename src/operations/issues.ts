import { z } from 'zod';
import { planeRequest } from '../common/utils.js';
import {
  PROJECTS,
  getProjectConfig,
  getStateId,
  getStateName,
  getValidStates,
  parseTicketId,
  formatTicketId,
  ProjectIdentifier,
} from '../config/projects.js';
import { PlaneValidationError, PlaneNotFoundError } from '../common/errors.js';

const projectIdentifiers = ['SBS', 'MOB', 'DE', 'OMNI', 'MWP', 'QUELL', '4ORM4'] as const;

// Schemas
export const ListIssuesSchema = z.object({
  project: z.enum(projectIdentifiers).describe('Project identifier (SBS, MOB, DE, OMNI, MWP, QUELL, 4ORM4)'),
  state: z.string().optional().describe('Filter by state name (e.g., "In Progress", "Todo")'),
  priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).optional().describe('Filter by priority'),
  limit: z.number().default(50).describe('Maximum number of issues to return'),
});

export const GetIssueSchema = z.object({
  ticket_id: z.string().describe('Ticket ID in display format (e.g., SBS-123, MOB-45)'),
});

export const CreateIssueSchema = z.object({
  project: z.enum(projectIdentifiers).describe('Project identifier'),
  name: z.string().min(1).describe('Issue title'),
  description_html: z.string().optional().describe('HTML description'),
  priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).default('none').describe('Priority level'),
  state: z.string().optional().describe('State name (defaults to "Todo")'),
  assignees: z.array(z.string()).optional().describe('Array of user UUIDs'),
  labels: z.array(z.string()).optional().describe('Array of label UUIDs'),
  start_date: z.string().optional().describe('Start date (YYYY-MM-DD)'),
  target_date: z.string().optional().describe('Due date (YYYY-MM-DD)'),
  parent: z.string().optional().describe('Parent issue UUID for sub-issues'),
});

export const UpdateIssueSchema = z.object({
  ticket_id: z.string().describe('Ticket ID in display format (e.g., SBS-123)'),
  name: z.string().optional().describe('New issue title'),
  description_html: z.string().optional().describe('New HTML description'),
  priority: z.enum(['none', 'low', 'medium', 'high', 'urgent']).optional().describe('New priority'),
  state: z.string().optional().describe('New state name (e.g., "In Progress", "Done")'),
  assignees: z.array(z.string()).optional().describe('New assignees array'),
  labels: z.array(z.string()).optional().describe('New labels array'),
  start_date: z.string().nullable().optional().describe('New start date'),
  target_date: z.string().nullable().optional().describe('New due date'),
});

export const DeleteIssueSchema = z.object({
  ticket_id: z.string().describe('Ticket ID in display format (e.g., SBS-123)'),
});

// Types
interface PlaneIssue {
  id: string;
  sequence_id: number;
  name: string;
  description_html?: string;
  priority: string;
  state: string;
  assignees: string[];
  labels: string[];
  start_date?: string;
  target_date?: string;
  created_at: string;
  updated_at: string;
  created_by: string;
}

interface PlaneIssueListResponse {
  results?: PlaneIssue[];
  count?: number;
}

// Helper to format issue response with display ticket ID
function formatIssue(issue: PlaneIssue, project: ProjectIdentifier) {
  return {
    ticket_id: formatTicketId(project, issue.sequence_id),
    id: issue.id,
    name: issue.name,
    description_html: issue.description_html,
    priority: issue.priority,
    state: getStateName(project, issue.state) || issue.state,
    state_id: issue.state,
    assignees: issue.assignees,
    labels: issue.labels,
    start_date: issue.start_date,
    target_date: issue.target_date,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
    created_by: issue.created_by,
  };
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
      `Invalid ticket ID format: ${ticketId}. Expected format like SBS-123 or 4ORM4-26`
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
export async function listIssues(options: z.infer<typeof ListIssuesSchema>) {
  const projectConfig = getProjectConfig(options.project);

  let endpoint = `/projects/${projectConfig.id}/issues/?per_page=${options.limit}`;

  // Add state filter if provided
  if (options.state) {
    const stateId = getStateId(options.project, options.state);
    if (!stateId) {
      const validStates = getValidStates(options.project);
      throw new PlaneValidationError(
        `Invalid state "${options.state}" for project ${options.project}. Valid states: ${validStates.join(', ')}`
      );
    }
    endpoint += `&state=${stateId}`;
  }

  // Add priority filter if provided
  if (options.priority) {
    endpoint += `&priority=${options.priority}`;
  }

  const response = await planeRequest<PlaneIssue[] | PlaneIssueListResponse>(endpoint);
  const issues = Array.isArray(response) ? response : response.results || [];

  return {
    issues: issues.map((issue) => formatIssue(issue, options.project)),
    total: issues.length,
    project: options.project,
  };
}

export async function getIssue(ticketId: string) {
  const { project, issueId, projectId } = await resolveTicketId(ticketId);

  const issue = await planeRequest<PlaneIssue>(`/projects/${projectId}/issues/${issueId}/`);

  return formatIssue(issue, project);
}

export async function createIssue(options: z.infer<typeof CreateIssueSchema>) {
  const projectConfig = getProjectConfig(options.project);

  // Resolve state name to ID, default to "Todo"
  const stateName = options.state || 'Todo';
  const stateId = getStateId(options.project, stateName);

  if (!stateId) {
    const validStates = getValidStates(options.project);
    throw new PlaneValidationError(
      `Invalid state "${stateName}" for project ${options.project}. Valid states: ${validStates.join(', ')}`
    );
  }

  const body: Record<string, unknown> = {
    name: options.name,
    priority: options.priority,
    state: stateId,
  };

  if (options.description_html) body.description_html = options.description_html;
  if (options.assignees) body.assignees = options.assignees;
  if (options.labels) body.labels = options.labels;
  if (options.start_date) body.start_date = options.start_date;
  if (options.target_date) body.target_date = options.target_date;
  if (options.parent) body.parent = options.parent;

  const issue = await planeRequest<PlaneIssue>(`/projects/${projectConfig.id}/issues/`, {
    method: 'POST',
    body,
  });

  return { status: 'done', ticket_id: formatTicketId(options.project, issue.sequence_id) };
}

export async function updateIssue(options: z.infer<typeof UpdateIssueSchema>) {
  const { project, issueId, projectId } = await resolveTicketId(options.ticket_id);

  const body: Record<string, unknown> = {};

  if (options.name !== undefined) body.name = options.name;
  if (options.description_html !== undefined) body.description_html = options.description_html;
  if (options.priority !== undefined) body.priority = options.priority;
  if (options.assignees !== undefined) body.assignees = options.assignees;
  if (options.labels !== undefined) body.labels = options.labels;
  if (options.start_date !== undefined) body.start_date = options.start_date;
  if (options.target_date !== undefined) body.target_date = options.target_date;

  // Resolve state name to ID if provided
  if (options.state !== undefined) {
    const stateId = getStateId(project, options.state);
    if (!stateId) {
      const validStates = getValidStates(project);
      throw new PlaneValidationError(
        `Invalid state "${options.state}" for project ${project}. Valid states: ${validStates.join(', ')}`
      );
    }
    body.state = stateId;
  }

  await planeRequest<PlaneIssue>(`/projects/${projectId}/issues/${issueId}/`, {
    method: 'PATCH',
    body,
  });

  return { status: 'done' };
}

export async function deleteIssue(ticketId: string) {
  const { issueId, projectId } = await resolveTicketId(ticketId);

  await planeRequest(`/projects/${projectId}/issues/${issueId}/`, {
    method: 'DELETE',
  });

  return { success: true, ticket_id: ticketId };
}
