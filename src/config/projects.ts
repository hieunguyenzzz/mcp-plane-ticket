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
    instance: 'mobelaris' as InstanceAlias,
    id: '2c53d0b7-3627-4fbc-8021-050254d4e7dd',
    name: 'soundboxstore.com',
    states: {
      'Backlog': 'ac5226c5-9bbe-44d0-b4e2-4fac83f93c2a',
      'Todo': '47a6674a-3862-40db-9efe-44f40d7b5ecb',
      'In Progress': '0ae42a59-c538-4d54-a6bf-8d244ace7256',
      'PR Submitted': '57658c75-9619-4e11-aa4d-f2f94b21d742',
      'Live Testing': 'deb395cc-860d-4b6b-ae7a-a2faf190b30b',
      'Done': '741f81e9-a3e2-4c5f-ad11-2a5bef3de270',
      'Cancelled': '1bb2d196-954b-47da-8413-b65db0af7317',
    },
  },
  OMNI: {
    instance: 'mobelaris' as InstanceAlias,
    id: '79b51293-36c9-4a96-be2e-261bca5604d7',
    name: 'omni.com',
    states: {
      'Backlog': '6ef484ab-8150-4f7d-8eb7-b61b7b01bfc9',
      'Todo': 'f96eee5b-4ac0-432d-8683-0a710e91b88b',
      'In Progress': '7ec86edc-c2f6-4e1b-9265-fb842fb569a9',
      'PR Submitted': 'b750456c-bb71-4189-877c-5791f0e03a0e',
      'Done': 'ef62efbd-4893-4ccd-93a1-d140d7409188',
      'Cancelled': 'f93777c8-f265-48e8-9e2a-ac33bf2daa0c',
    },
  },
  MOB: {
    instance: 'mobelaris' as InstanceAlias,
    id: 'e031245f-8d5e-44a2-b325-4d4ad4850a58',
    name: 'mobelaris.com',
    states: {
      'Backlog': 'aadacb28-9531-4501-ba45-c8d4ba919a49',
      'Todo': '6fa63cdf-bf16-42a6-8e8c-b27351fd22b7',
      'In Progress': 'e07ffb71-22f2-4c30-bcf7-e345a340d736',
      'PR Submitted': '2044f653-91cb-4b01-9324-ae7e735d2196',
      'Staging Testing': '4e3b8e8a-25f1-4d50-9527-82fef8a451da',
      'Live Testing': '6be80476-d322-43aa-ae29-73b1665accec',
      'Done': '7ccd0abf-5037-40dc-95c3-c12e89570510',
      'Cancelled': '46c5fdbe-907b-4c5a-9b43-ccd617c55f7e',
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
    instance: 'mobelaris' as InstanceAlias,
    id: 'cfcfcaa3-5d35-47af-9f56-57a2db3951b6',
    name: 'designereditions.com',
    states: {
      'Backlog': 'fddec96a-50e2-4aa3-b8c1-2a29dddf5ff8',
      'Todo': '2f6b1d0f-8175-4a39-a981-fa9ca0e26854',
      'In Progress': '43fd1296-9a46-429c-9bb7-12bc4cd5aa9b',
      'PR Submitted': '383e6ce2-a8b6-423f-8a3a-8e8fefce158d',
      'Pull Request Reviewing': '6a6e61d5-8c67-4a00-b3d0-e7a55d58c297',
      'Staging Testing': '62a8aefa-fc10-407e-bc98-75588264c224',
      'Live Testing': 'be56565c-feb8-4d40-b367-c7f585f2c792',
      'Done': 'a2a27fc5-c0a0-4f71-a0ea-16593da104b5',
      'Cancelled': 'fdecf2bc-4c59-4a39-a6df-4b457b258e61',
    },
  },
  QUELL: {
    instance: 'mobelaris' as InstanceAlias,
    id: '24966761-9dc8-4513-afd2-132b294eae7b',
    name: 'quelldesign.com',
    states: {
      'Backlog': 'b58481d8-18e9-43da-a3a4-e686655d2116',
      'Todo': 'c3a0403c-4a8b-4383-92e1-f631700a8544',
      'In Progress': '2b2d7491-2d38-461a-92be-159fdfb0ba2a',
      'PR Submitted': 'a1f2bff4-32b4-4473-be6d-503c66e1ad2b',
      'PR Review': 'a1fe3672-0670-49fe-84b8-eef847561c42',
      'Testing on Live': 'c412f41c-667d-43bc-96e1-a5941b93ba39',
      'Done': '878234e8-ba13-42e9-b2c2-9fe017c53f97',
      'Cancelled': '0d6a9346-2576-459a-8c0c-a292b1412f0c',
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
