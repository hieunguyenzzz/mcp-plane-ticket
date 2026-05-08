import {
  InstanceAlias,
  getInstanceConfig,
  resolveInstanceApiKey,
} from '../config/projects.js';
import { createPlaneError, PlaneAuthError } from './errors.js';

type RequestOptions = {
  method?: string;
  body?: unknown;
};

export async function planeRequest<T = unknown>(
  endpoint: string,
  options: RequestOptions = {},
  instance: InstanceAlias,
): Promise<T> {
  const cfg = getInstanceConfig(instance);
  const apiKey = resolveInstanceApiKey(instance);

  if (!apiKey) {
    const fallbackHint = cfg.apiKeyEnvFallback
      ? ` (or ${cfg.apiKeyEnvFallback})`
      : '';
    throw new PlaneAuthError(
      `Plane API key for instance "${cfg.alias}" is not set. Set ${cfg.apiKeyEnv}${fallbackHint}.`
    );
  }

  const url = `${cfg.baseUrl}/workspaces/${cfg.workspace}${endpoint}`;

  const response = await fetch(url, {
    method: options.method || 'GET',
    headers: {
      'X-API-Key': apiKey,
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
