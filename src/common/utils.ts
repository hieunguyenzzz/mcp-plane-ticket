import { PLANE_CONFIG } from '../config/projects.js';
import { createPlaneError, PlaneAuthError } from './errors.js';

type RequestOptions = {
  method?: string;
  body?: unknown;
};

export async function planeRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  if (!PLANE_CONFIG.apiKey) {
    throw new PlaneAuthError('PLANE_API_KEY environment variable is not set');
  }

  const url = `${PLANE_CONFIG.baseUrl}/workspaces/${PLANE_CONFIG.workspace}${endpoint}`;

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'X-API-Key': PLANE_CONFIG.apiKey,
      'Content-Type': 'application/json',
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
  });

  // Handle DELETE which may return no content
  if (response.status === 204) {
    return {} as T;
  }

  const responseBody = await response.json().catch(() => null);

  if (!response.ok) {
    throw createPlaneError(response.status, responseBody as Record<string, unknown> | null);
  }

  return responseBody as T;
}
