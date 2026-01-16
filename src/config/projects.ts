// Plane API configuration
export const PLANE_CONFIG = {
  baseUrl: 'https://plane.mobelaris.com/api/v1',
  workspace: 'soundboxstore',
  apiKey: process.env.PLANE_API_KEY || '',
};

// Project configurations with IDs and state mappings
export const PROJECTS = {
  SBS: {
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
} as const;

export type ProjectIdentifier = keyof typeof PROJECTS;
export type Priority = 'none' | 'low' | 'medium' | 'high' | 'urgent';

// Helper functions
export function getProjectConfig(identifier: ProjectIdentifier) {
  return PROJECTS[identifier];
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

// Parse ticket ID like "SBS-123" into { project: "SBS", sequenceId: 123 }
export function parseTicketId(ticketId: string): { project: ProjectIdentifier; sequenceId: number } | null {
  const match = ticketId.match(/^([A-Z]+)-(\d+)$/);
  if (!match) return null;
  const project = match[1];
  if (!isValidProject(project)) return null;
  return { project, sequenceId: parseInt(match[2], 10) };
}

// Format ticket ID from project and sequence
export function formatTicketId(project: ProjectIdentifier, sequenceId: number): string {
  return `${project}-${sequenceId}`;
}
