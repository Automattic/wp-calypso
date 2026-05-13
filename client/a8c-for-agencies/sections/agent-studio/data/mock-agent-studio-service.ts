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

const emptyState: AgentStudioMockState = { projects: [], outputs: [] };

const isBrowser = () => typeof window !== 'undefined' && !! window.localStorage;

const readState = (): AgentStudioMockState => {
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
