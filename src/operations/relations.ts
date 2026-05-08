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

// Plane API returns relations as { blocking: ["uuid", ...], blocked_by: [...], ... }
// Values are bare issue UUIDs — caller must resolve them to ticket IDs.
type PlaneRelationsResponse = Record<string, string[]>;

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
  const instance = getProjectInstance(project);

  const response = await planeRequest<PlaneRelationsResponse>(
    `/projects/${projectId}/work-items/${issueId}/relations/`,
    {},
    instance,
  );

  // Pull only known relation types — the API also returns time-based ones
  // (start_after/finish_before/...) that aren't surfaced via the MCP today.
  const pairs: Array<{ relation_type: string; uuid: string }> = [];
  for (const type of relationTypes) {
    const ids = response[type];
    if (Array.isArray(ids)) {
      for (const uuid of ids) {
        if (typeof uuid === 'string') pairs.push({ relation_type: type, uuid });
      }
    }
  }

  if (pairs.length === 0) {
    return { ticket_id: ticketId, relations: [], total: 0 };
  }

  // Resolve UUIDs to ticket IDs via the parent project's issue list. Cross-project
  // relations on the same instance fall back to a short-UUID hint.
  const issuesResp = await planeRequest<PlaneIssue[] | PlaneIssueListResponse>(
    `/projects/${projectId}/issues/?per_page=200`,
    {},
    instance,
  );
  const issues = Array.isArray(issuesResp) ? issuesResp : issuesResp.results || [];
  const uuidToSeq = new Map<string, number>();
  for (const i of issues) uuidToSeq.set(i.id, i.sequence_id);

  return {
    ticket_id: ticketId,
    relations: pairs.map(({ relation_type, uuid }) => {
      const seq = uuidToSeq.get(uuid);
      return {
        relation_type,
        related_ticket_id:
          seq !== undefined
            ? formatTicketId(project, seq)
            : `<unresolved:${uuid.slice(0, 8)}>`,
        related_issue_id: uuid,
      };
    }),
    total: pairs.length,
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
