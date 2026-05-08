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

const relationTypes = ['relates_to', 'blocked_by', 'blocking', 'duplicate'] as const;

// Schemas
export const AddRelationSchema = z.object({
  ticket_id: z.string().describe('Ticket ID in display format (e.g., SBS-123)'),
  related_ticket_id: z.string().describe('Related ticket ID in display format (e.g., SBS-456)'),
  relation_type: z.enum(relationTypes).describe('Relation type: relates_to, blocked_by, blocking, duplicate'),
});

export const ListRelationsSchema = z.object({
  ticket_id: z.string().describe('Ticket ID in display format (e.g., SBS-123)'),
});

// Types
interface PlaneIssue {
  id: string;
  sequence_id: number;
}

interface PlaneIssueListResponse {
  results?: PlaneIssue[];
}

interface PlaneRelationItem {
  id: string;
  name: string;
  sequence_id: number;
  project_id: string;
  relation_type: string;
  state_id: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface PlaneRelationsResponse {
  blocking: PlaneRelationItem[];
  blocked_by: PlaneRelationItem[];
  duplicate: PlaneRelationItem[];
  relates_to: PlaneRelationItem[];
  [key: string]: PlaneRelationItem[];
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
export async function listRelations(ticketId: string) {
  const { project, issueId, projectId } = await resolveTicketId(ticketId);

  // Relations endpoint only exists under work-items path (Plane v1.3+)
  const response = await planeRequest<PlaneRelationsResponse>(
    `/projects/${projectId}/work-items/${issueId}/relations/`,
    {},
    getProjectInstance(project),
  );

  // Response is grouped by relation type: { blocking: [...], blocked_by: [...], ... }
  const allRelations: Array<{ relation_type: string } & PlaneRelationItem> = [];
  for (const [type, items] of Object.entries(response)) {
    if (Array.isArray(items)) {
      for (const item of items) {
        allRelations.push({ ...item, relation_type: type });
      }
    }
  }

  return {
    ticket_id: ticketId,
    relations: allRelations.map((rel) => ({
      id: rel.id,
      relation_type: rel.relation_type,
      related_ticket_id: formatTicketId(project, rel.sequence_id),
      name: rel.name,
      priority: rel.priority,
      created_at: rel.created_at,
    })),
    total: allRelations.length,
  };
}

export async function addRelation(options: z.infer<typeof AddRelationSchema>) {
  const { project, issueId, projectId } = await resolveTicketId(options.ticket_id);
  const related = await resolveTicketId(options.related_ticket_id);

  // Cross-instance relations are not supported by Plane (each instance has its own DB).
  if (getProjectInstance(project) !== getProjectInstance(related.project)) {
    throw new PlaneValidationError(
      `Cannot relate ${options.ticket_id} (${getProjectInstance(project)}) to ${options.related_ticket_id} (${getProjectInstance(related.project)}): tickets are on different Plane instances.`
    );
  }

  // Relations endpoint only exists under work-items path (Plane v1.3+)
  // Body uses "issues" array (not "related_issue") per API docs
  await planeRequest(
    `/projects/${projectId}/work-items/${issueId}/relations/`,
    {
      method: 'POST',
      body: {
        relation_type: options.relation_type,
        issues: [related.issueId],
      },
    },
    getProjectInstance(project),
  );

  return { status: 'done' };
}
