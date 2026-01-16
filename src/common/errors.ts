export class PlaneError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly response: unknown
  ) {
    super(message);
    this.name = 'PlaneError';
  }
}

export class PlaneNotFoundError extends PlaneError {
  constructor(resource: string) {
    super(`Not found: ${resource}`, 404, { message: `${resource} not found` });
    this.name = 'PlaneNotFoundError';
  }
}

export class PlaneValidationError extends PlaneError {
  constructor(message: string, details?: unknown) {
    super(message, 422, details);
    this.name = 'PlaneValidationError';
  }
}

export class PlaneAuthError extends PlaneError {
  constructor(message = 'Authentication failed') {
    super(message, 401, { message });
    this.name = 'PlaneAuthError';
  }
}

export function isPlaneError(error: unknown): error is PlaneError {
  return error instanceof PlaneError;
}

export function createPlaneError(status: number, response: Record<string, unknown> | null): PlaneError {
  const message = (response?.message || response?.detail || 'Plane API error') as string;

  switch (status) {
    case 401:
      return new PlaneAuthError(message);
    case 404:
      return new PlaneNotFoundError(message);
    case 422:
      return new PlaneValidationError(message, response);
    default:
      return new PlaneError(message, status, response);
  }
}

export function formatPlaneError(error: PlaneError): string {
  if (error instanceof PlaneNotFoundError) {
    return `Not Found: ${error.message}`;
  }
  if (error instanceof PlaneAuthError) {
    return `Authentication Failed: ${error.message}`;
  }
  if (error instanceof PlaneValidationError) {
    let message = `Validation Error: ${error.message}`;
    if (error.response) {
      message += `\nDetails: ${JSON.stringify(error.response)}`;
    }
    return message;
  }
  return `Plane API Error: ${error.message}`;
}
