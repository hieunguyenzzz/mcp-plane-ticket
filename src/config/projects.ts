// Plane instance registry. Each instance has its own base URL, workspace, and API key env var.
// Mirrors the dokploy MCP's SERVERS pattern.

export interface InstanceConfig {
  alias: string;
  baseUrl: string;
  workspace: string;
  apiKeyEnv: string;
  // Optional fallback env var (e.g., legacy PLANE_API_KEY for the default instance)
  apiKeyEnvFallback?: string;
}

export const INSTANCES = {
  mobelaris: {
    alias: 'mobelaris',
    baseUrl: 'https://plane.mobelaris.com/api/v1',
    workspace: 'soundboxstore',
    apiKeyEnv: 'MOBELARIS_PLANE_API_KEY',
    apiKeyEnvFallback: 'PLANE_API_KEY',
  },
  soundboxstore: {
    alias: 'soundboxstore',
    baseUrl: 'https://plane.soundboxstore.com/api/v1',
    workspace: 'soundboxstore',
    apiKeyEnv: 'SOUNDBOXSTORE_PLANE_API_KEY',
  },
} as const satisfies Record<string, InstanceConfig>;

export type InstanceAlias = keyof typeof INSTANCES;
export const DEFAULT_INSTANCE: InstanceAlias = 'mobelaris';

export function getInstanceConfig(alias: InstanceAlias): InstanceConfig {
  return INSTANCES[alias] as InstanceConfig;
}

export function resolveInstanceApiKey(alias: InstanceAlias): string {
  const cfg = getInstanceConfig(alias);
  return (
    process.env[cfg.apiKeyEnv]
    || (cfg.apiKeyEnvFallback ? process.env[cfg.apiKeyEnvFallback] : '')
    || ''
  );
}

// Project configurations with IDs and state mappings.
// Each project belongs to exactly one instance (project never lives on both at once).
// Step 1: every existing project stays on `mobelaris`; AUTOMATION is the only soundboxstore project.
// Step 2/3: flip `instance` (and `id`/`states`) per project as it migrates.
export const PROJECTS = {
  SBS: {
    instance: 'soundboxstore' as InstanceAlias,
    id: '3f9ebc36-f905-49d3-b25e-6bde81dd95a1',
    name: 'soundboxstore.com',
    states: {
      'Backlog': 'fd2b1bc1-81e7-46de-95ef-fc1afa416a66',
      'Todo': '7a46357c-86bf-477d-836e-45720335d20a',
      'In Progress': 'b3c65102-dde6-4b07-bce6-e136eb7986b1',
      'PR Submitted': '7a4c261b-7862-455d-b5b3-b908870d4d8b',
      'Live Testing': 'fb2ebcc5-f379-4eff-9435-f8c82e89c4ce',
      'Done': '0a73dbde-6879-4645-8694-9713676ac174',
      'Cancelled': '56ce953e-9e91-48a2-a965-ee8e7c4efa39',
    },
  },
  OMNI: {
    instance: 'soundboxstore' as InstanceAlias,
    id: '05ebf200-296e-4d31-b779-7af39d68b77e',
    name: 'omni.com',
    states: {
      'Backlog': 'cc02d613-a6fe-404c-a975-9b1283979739',
      'Todo': '6f72c24f-0884-45e9-b854-0c2568b6724c',
      'In Progress': '0e790f38-71e6-4840-bcda-ed7a2d74a54f',
      'PR Submitted': '730d07f7-afe2-4011-8e31-0fe84fbe0f59',
      'Done': 'd46ee42e-5c77-4383-aeef-3a757a22a8e0',
      'Cancelled': 'e4d6803c-2cb2-4583-8223-9b9c524345df',
    },
  },
  MOB: {
    instance: 'soundboxstore' as InstanceAlias,
    id: 'e511fc00-571d-43f9-a5e5-17888b475e90',
    name: 'mobelaris.com',
    states: {
      'Backlog': '3d79bb51-50d7-4a69-a387-0c35546804c8',
      'Todo': 'b77ae80f-e866-4295-a02a-5be76c88d81f',
      'In Progress': '3828ba45-9a6d-43e9-99ea-b9a1381534ae',
      'PR Submitted': 'd369eba7-3035-43d2-89f9-08aeb805c9b9',
      'Staging Testing': '2f50ba48-1e74-41d2-afa5-1e84bd885852',
      'Live Testing': '6a937467-5dc7-4981-b069-c660bcf47ea3',
      'Done': '3ff47867-a5d0-4adc-ab62-5d9efc5958e6',
      'Cancelled': '8fc59d30-37f6-45ea-adca-4ee7850bd408',
    },
  },
  MWP: {
    instance: 'mobelaris' as InstanceAlias,
    id: 'c28b96e5-29fa-415d-af79-8125d4d486c3',
    name: 'merakiweddingplanner.com',
    states: {
      'Backlog': '57d7808a-fafa-42ef-9503-12de39c15080',
      'Todo': '7a0c8b7c-81f0-4135-9ada-d9615b1b55e2',
      'In Progress': '6e516fb3-3a5a-4c4e-9e44-ed9896349003',
      'PR Submitted': 'b61403ce-f17d-45b6-aa98-ab7f97ff7260',
      'Done': '143c5106-e56c-484d-9494-bef4d668db87',
      'Cancelled': '7cb724c8-3127-4030-8aeb-ea6742a00826',
    },
  },
  DE: {
    instance: 'soundboxstore' as InstanceAlias,
    id: 'c1b1de07-f3d3-4d0c-bd61-6812d0f7a119',
    name: 'designereditions.com',
    states: {
      'Backlog': 'f1217c8c-ccd4-4185-a150-0fb3a19b12d7',
      'Todo': 'aea24fb3-e44e-4df2-b163-3a5deb27033c',
      'In Progress': '208b171f-3d81-4ce5-bb2c-b58778d7e702',
      'PR Submitted': 'a639428e-150f-46d1-8747-65d14875a871',
      'Pull Request Reviewing': 'd74c6367-0ef8-4942-8b46-89df82f39829',
      'Staging Testing': '7e512093-9eb4-4dca-8dcd-c025277db1b4',
      'Live Testing': 'bbb2a4c7-3798-4777-8c17-c298a446b7d4',
      'Done': 'b4afeaba-1df9-4c75-9090-c8ea4e2ce6ec',
      'Cancelled': 'bd671da3-99eb-4b72-9925-000222837f0e',
    },
  },
  QUELL: {
    instance: 'soundboxstore' as InstanceAlias,
    id: 'bbd3fa1c-83c0-4f2d-8373-520134c77c11',
    name: 'quelldesign.com',
    states: {
      'Backlog': '6073f826-e2b2-458a-9ef8-f16966e0682a',
      'Todo': 'e3d6042d-617e-40a5-9374-bde34910627c',
      'In Progress': '2d9b3624-1e58-43a8-8ef2-8e07c2958e76',
      'PR Submitted': 'b4f949e0-6497-45f2-b654-49159489a90d',
      'PR Review': '1ce5e314-9e32-4582-90e2-1a2d1b0e858a',
      'Testing on Live': '3369257f-a98d-4d0f-ad5f-3a5f3ba9365d',
      'Done': 'cceb43c2-439e-48c9-bb9a-880dc76ed8a9',
      'Cancelled': '95b251b1-c632-4c64-9055-ed58a86137a0',
    },
  },
  '4ORM4': {
    instance: 'mobelaris' as InstanceAlias,
    id: '0bd124d7-16ce-47ef-9109-94652d169a4a',
    name: '4orm4.ae',
    states: {
      'Backlog': 'a5513fdc-5718-4267-93f9-bbd3ff8bfd87',
      'Todo': '3507479f-0f7c-4c30-acd6-578f2546ebf1',
      'In Progress': 'b86f19ba-907e-4ef4-a395-d35e488687d6',
      'Live Testing': '25b215b6-b491-4221-bdf1-3547cd343c6c',
      'Done': 'da42d2be-beaf-4fad-b0ad-3b265d8bf40c',
      'Cancelled': '25d49ff7-c79a-45ef-a26c-ce22f49e8983',
    },
  },
  MAILA: {
    instance: 'mobelaris' as InstanceAlias,
    id: '985b823f-c43f-45a4-aac2-378780dafaf1',
    name: 'mail-agent',
    states: {
      'Backlog': '82e83f8e-2db2-4900-8e14-ecda3f91f35f',
      'Todo': 'abe67f55-10b8-42dc-bf9c-cf7197b9844e',
      'In Progress': '8a9e69a0-331b-42d3-b39e-f043322bb36c',
      'Done': 'f8418ce6-dbcc-4fad-a91d-41d59f5454b2',
      'Cancelled': '68a9c340-e206-43a2-bf9f-c234b88a7b7d',
    },
  },
  ERPSB: {
    instance: 'mobelaris' as InstanceAlias,
    id: 'c63830fe-6a30-49a2-acc6-c674b35bd728',
    name: 'soundbox-erp',
    states: {
      'Backlog': '9a677618-8d1c-443e-919c-fc6eac8392a6',
      'Todo': '28473f9f-143b-428b-b0cf-6991ff3e4959',
      'In Progress': '05a57678-75f3-4983-ac35-baa779976bf2',
      'Done': '88f57d31-ffa8-47fa-8683-c074ca95eea6',
      'Cancelled': 'b62a8a4c-bd9f-4be2-ad77-21e95ea36275',
    },
  },
  ALPHA: {
    instance: 'mobelaris' as InstanceAlias,
    id: 'ebc14d31-4526-4eca-bdf6-6482debd40a2',
    name: 'alphanode-mcp',
    states: {
      'Backlog': 'a5fe0845-5b64-41cc-a986-5b4062cc3b1e',
      'Todo': '92e77b06-b052-4879-a696-0da7b4cb5f21',
      'In Progress': '1ba0c484-2518-446b-8443-32d390537e5a',
      'PR Submitted': 'f4e54b25-4016-4bdb-838f-cf8e5afad377',
      'Live Testing': '00fa5682-1581-4678-88e2-d22d8b914d9e',
      'Done': 'fd985fe0-f093-4ada-aee3-a41708b359da',
      'Cancelled': '2a0648ac-8dd1-4693-b184-df1b887b0760',
    },
  },
  RANKL: {
    instance: 'mobelaris' as InstanceAlias,
    id: 'b2f23909-c227-466d-bf98-5d28cf50b965',
    name: 'ranklore',
    states: {
      'Backlog': '48e6936e-e406-4557-9670-40ab09d9b0c9',
      'Todo': 'd309342a-c056-4500-b1c5-572aba232bcf',
      'In Progress': '17b5e803-4337-4787-bba1-9fb56c08d035',
      'Done': '2c27c280-6442-49ca-a9e8-4eb34d26a967',
      'Cancelled': '7b831e81-f0be-4375-b61c-d513f1400aa9',
    },
  },
  AUTOMATION: {
    instance: 'soundboxstore' as InstanceAlias,
    id: 'fc36ac46-70f2-4512-80b5-5e33457e3b12',
    name: 'Automation',
    states: {
      'Backlog': '0decf0a9-cec8-4fc9-83d9-bad6bddff6f8',
      'Todo': 'f3b1e375-c6a3-498c-8fd2-1b5515d4067d',
      'In Progress': '7e3632bb-0e8a-4f4c-800c-7270383f562e',
      'Done': '2816572a-fdaf-4b0d-98a3-0e946992fc8a',
      'Cancelled': '73d962b2-ec25-4568-9a66-0ec8b3f32ee7',
    },
  },
} as const;

export type ProjectIdentifier = keyof typeof PROJECTS;
export type Priority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

// Helper functions
export function getProjectConfig(identifier: ProjectIdentifier) {
  return PROJECTS[identifier];
}

export function getProjectInstance(identifier: ProjectIdentifier): InstanceAlias {
  return PROJECTS[identifier].instance;
}

export function isValidProject(identifier: string): identifier is ProjectIdentifier {
  return identifier in PROJECTS;
}

export function getStateId(project: ProjectIdentifier, stateName: string): string | undefined {
  const config = PROJECTS[project];
  const states = config.states as Record<string, string>;
  return states[stateName];
}

export function getStateName(project: ProjectIdentifier, stateId: string): string | undefined {
  const config = PROJECTS[project];
  const states = config.states as Record<string, string>;
  for (const [name, id] of Object.entries(states)) {
    if (id === stateId) return name;
  }
  return undefined;
}

export function getValidStates(project: ProjectIdentifier): string[] {
  const config = PROJECTS[project];
  return Object.keys(config.states);
}

// Parse ticket ID like "SBS-123" or "4ORM4-26" into { project: "SBS", sequenceId: 123 }
export function parseTicketId(ticketId: string): { project: ProjectIdentifier; sequenceId: number } | null {
  const match = ticketId.match(/^([A-Z0-9]+)-(\d+)$/);
  if (!match) return null;
  const project = match[1];
  if (!isValidProject(project)) return null;
  return { project, sequenceId: parseInt(match[2], 10) };
}

// Format ticket ID from project and sequence
export function formatTicketId(project: ProjectIdentifier, sequenceId: number): string {
  return `${project}-${sequenceId}`;
}
