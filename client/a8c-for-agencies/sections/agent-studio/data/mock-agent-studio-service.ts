import type {
	AgentStudioOutput,
	AgentStudioProject,
	AgentStudioProjectSummary,
	AgentStudioService,
	CreateAgentStudioProjectInput,
} from '../types';

interface AgentStudioMockState {
	projects: AgentStudioProject[];
	outputs: AgentStudioOutput[];
}

const STORAGE_KEY = 'a4a-agent-studio-mock-state';
const DEMO_QUERY_PARAM = 'demo';
const DEMO_QUERY_VALUE = 'projects';

const emptyState: AgentStudioMockState = { projects: [], outputs: [] };

const demoState: AgentStudioMockState = {
	projects: [
		{
			id: 'project-wceu-launch',
			name: 'WCEU launch campaign',
			clientName: 'Atlas Studio',
			brief: 'Prepare launch materials for an agency campaign around WordCamp Europe.',
			createdAt: '2026-05-01T10:00:00.000Z',
			updatedAt: '2026-05-10T15:30:00.000Z',
		},
		{
			id: 'project-migration-pitch',
			name: 'Pressable migration pitch',
			clientName: 'Northstar Digital',
			brief: 'Package a migration proposal for a client evaluating managed WordPress hosting.',
			createdAt: '2026-04-24T11:20:00.000Z',
			updatedAt: '2026-05-08T09:45:00.000Z',
		},
		{
			id: 'project-retainer-reporting',
			name: 'Monthly retainer reporting',
			clientName: 'Aperture Labs',
			brief: 'Create reusable assets for monthly client updates and performance summaries.',
			createdAt: '2026-04-18T14:10:00.000Z',
			updatedAt: '2026-05-03T12:15:00.000Z',
		},
	],
	outputs: [
		{
			id: 'output-wceu-social-kit',
			projectId: 'project-wceu-launch',
			title: 'Launch social kit',
			description: 'Square, story, and banner directions for the campaign announcement.',
			agentName: 'Bea',
			deliverableType: 'Asset kit',
			status: 'ready',
			createdAt: '2026-05-10T15:30:00.000Z',
			updatedAt: '2026-05-10T15:30:00.000Z',
		},
		{
			id: 'output-wceu-one-pager',
			projectId: 'project-wceu-launch',
			title: 'Partner one-pager',
			description: 'A concise client-facing one-pager for the campaign offer.',
			agentName: 'Ela',
			deliverableType: 'One-pager',
			status: 'ready',
			createdAt: '2026-05-09T13:05:00.000Z',
			updatedAt: '2026-05-09T13:05:00.000Z',
		},
		{
			id: 'output-migration-one-pager',
			projectId: 'project-migration-pitch',
			title: 'Migration pitch one-pager',
			description: 'A proposal summary focused on reliability, support, and launch timeline.',
			agentName: 'Ela',
			deliverableType: 'One-pager',
			status: 'ready',
			createdAt: '2026-05-08T09:45:00.000Z',
			updatedAt: '2026-05-08T09:45:00.000Z',
		},
		{
			id: 'output-retainer-summary',
			projectId: 'project-retainer-reporting',
			title: 'Executive summary direction',
			description: 'A draft reporting narrative for recurring client updates.',
			agentName: 'Ela',
			deliverableType: 'Report section',
			status: 'generating',
			createdAt: '2026-05-03T12:15:00.000Z',
			updatedAt: '2026-05-03T12:15:00.000Z',
		},
	],
};

const isBrowser = () => typeof window !== 'undefined' && !! window.localStorage;

const isDemoMode = () => {
	if ( typeof window === 'undefined' ) {
		return false;
	}
	const params = new URLSearchParams( window.location.search );
	return params.get( DEMO_QUERY_PARAM ) === DEMO_QUERY_VALUE;
};

const readState = (): AgentStudioMockState => {
	if ( isDemoMode() ) {
		return demoState;
	}

	if ( ! isBrowser() ) {
		return emptyState;
	}

	const savedState = window.localStorage.getItem( STORAGE_KEY );

	if ( ! savedState ) {
		return emptyState;
	}

	try {
		return JSON.parse( savedState );
	} catch {
		return emptyState;
	}
};

const writeState = ( state: AgentStudioMockState ) => {
	if ( isBrowser() ) {
		window.localStorage.setItem( STORAGE_KEY, JSON.stringify( state ) );
	}
};

const sortByUpdatedAt = < T extends { updatedAt: string } >( items: T[] ) =>
	[ ...items ].sort(
		( a, b ) => new Date( b.updatedAt ).getTime() - new Date( a.updatedAt ).getTime()
	);

const summarizeProject = (
	project: AgentStudioProject,
	outputs: AgentStudioOutput[]
): AgentStudioProjectSummary => {
	const projectOutputs = sortByUpdatedAt(
		outputs.filter( ( output ) => output.projectId === project.id )
	);

	return {
		...project,
		outputCount: projectOutputs.length,
		latestOutput: projectOutputs[ 0 ],
	};
};

const makeProjectId = () => `project-${ Date.now().toString( 36 ) }`;

export const mockAgentStudioService: AgentStudioService = {
	async listProjects() {
		const state = readState();

		return sortByUpdatedAt( state.projects ).map( ( project ) =>
			summarizeProject( project, state.outputs )
		);
	},

	async getProject( projectId ) {
		return readState().projects.find( ( project ) => project.id === projectId );
	},

	async createProject( input: CreateAgentStudioProjectInput ) {
		const state = readState();
		const now = new Date().toISOString();
		const project: AgentStudioProject = {
			id: makeProjectId(),
			name: input.name,
			clientName: input.clientName,
			brief: input.brief,
			createdAt: now,
			updatedAt: now,
		};

		writeState( {
			...state,
			projects: [ project, ...state.projects ],
		} );

		return project;
	},

	async deleteProject( projectId ) {
		const state = readState();
		writeState( {
			projects: state.projects.filter( ( project ) => project.id !== projectId ),
			outputs: state.outputs.filter( ( output ) => output.projectId !== projectId ),
		} );
	},

	async listProjectOutputs( projectId ) {
		return sortByUpdatedAt(
			readState().outputs.filter( ( output ) => output.projectId === projectId )
		);
	},
};
