import { __ } from '@wordpress/i18n';
import eventAssetsPreview from '../assets/agent-previews/event-assets.webp';
import onePagerPreview from '../assets/agent-previews/one-pager.webp';
import socialAssetsPreview from '../assets/agent-previews/social-assets.webp';
import type {
	AgentStudioOutput,
	AgentStudioProject,
	AgentStudioProjectSummary,
	AgentStudioService,
	CreateAgentStudioOutputInput,
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

const makeOutputId = () => `output-${ Date.now().toString( 36 ) }`;

// How long a deliverable stays in the "generating" state before the mock
// resolves it. Stands in for the async generation job the wpcom endpoint runs.
const GENERATION_DURATION_MS = 6000;

// Stand-in preview images for a resolved deliverable, reusing the agent
// preview art until generation streams real assets.
const MOCK_PREVIEW_URLS = [ socialAssetsPreview, onePagerPreview, eventAssetsPreview ];

/**
 * Derives a stable, deliverable-specific asset count from its id so a card
 * shows the same number on every render without persisting an extra field
 * before generation finishes.
 * @param outputId - The deliverable id.
 * @returns An asset count in the 12–72 range.
 */
const deriveAssetCount = ( outputId: string ): number => {
	let hash = 0;
	for ( let i = 0; i < outputId.length; i++ ) {
		hash = ( hash * 31 + outputId.charCodeAt( i ) ) >>> 0;
	}
	return 12 + ( hash % 61 );
};

/**
 * Flips any deliverable that has been generating past the generation window
 * into a ready state with mock previews, persisting the change. Stands in for
 * the async job that streams real results once the wpcom endpoint lands.
 * @param state - The current mock state.
 * @returns The state with elapsed deliverables resolved.
 */
const resolveGeneratingOutputs = ( state: AgentStudioMockState ): AgentStudioMockState => {
	const now = Date.now();
	let changed = false;

	const outputs = state.outputs.map( ( output ) => {
		if (
			output.status !== 'generating' ||
			now - new Date( output.createdAt ).getTime() < GENERATION_DURATION_MS
		) {
			return output;
		}

		changed = true;
		return {
			...output,
			status: 'ready' as const,
			previewUrls: MOCK_PREVIEW_URLS,
			assetCount: deriveAssetCount( output.id ),
			updatedAt: new Date( now ).toISOString(),
		};
	} );

	if ( ! changed ) {
		return state;
	}

	const nextState = { ...state, outputs };
	writeState( nextState );

	return nextState;
};

/**
 * Resolves the default project that every deliverable lands in, creating it on
 * first use. The service owns this so the client never has to know a "Default"
 * project exists — when the wpcom endpoint replaces this mock, the server will
 * provision it the same way.
 * @param state - The current mock state.
 * @returns The default project and the (possibly updated) state.
 */
const ensureDefaultProject = (
	state: AgentStudioMockState
): { project: AgentStudioProject; state: AgentStudioMockState } => {
	const existing = state.projects.find( ( project ) => project.isDefault );

	if ( existing ) {
		return { project: existing, state };
	}

	const now = new Date().toISOString();
	const project: AgentStudioProject = {
		id: makeProjectId(),
		name: __( 'Default' ),
		isDefault: true,
		createdAt: now,
		updatedAt: now,
	};
	const nextState = { ...state, projects: [ project, ...state.projects ] };

	writeState( nextState );

	return { project, state: nextState };
};

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

	async listOutputs() {
		const { project, state } = ensureDefaultProject( readState() );
		const resolved = resolveGeneratingOutputs( state );

		return sortByUpdatedAt(
			resolved.outputs.filter( ( output ) => output.projectId === project.id )
		);
	},

	async createOutput( input: CreateAgentStudioOutputInput ) {
		const { project, state } = ensureDefaultProject( readState() );
		const now = new Date().toISOString();
		const output: AgentStudioOutput = {
			id: makeOutputId(),
			projectId: project.id,
			title: input.title,
			description: input.description,
			agentName: input.agentName,
			deliverableType: input.deliverableType,
			status: 'generating',
			createdAt: now,
			updatedAt: now,
		};

		writeState( {
			...state,
			outputs: [ output, ...state.outputs ],
		} );

		return output;
	},

	async deleteOutput( outputId ) {
		const state = readState();
		writeState( {
			...state,
			outputs: state.outputs.filter( ( output ) => output.id !== outputId ),
		} );
	},

	async suggestOnePagerContent( brief, field ) {
		// Heuristic stand-in for the AI suggestion: the first line tends to be
		// the headline, the sentences after it frame the document. Swapped for
		// the real model call when the wpcom endpoint lands.
		const lines = brief
			.split( '\n' )
			.map( ( line ) => line.trim() )
			.filter( Boolean );

		if ( field === 'title' ) {
			const firstLine = lines[ 0 ] ?? '';
			return firstLine.length > 80 ? `${ firstLine.slice( 0, 79 ).trimEnd() }…` : firstLine;
		}

		const body = lines.slice( 1 ).join( ' ' ).trim();
		const sentences = ( body.match( /[^.!?]+[.!?]+/g ) ?? ( body ? [ body ] : [] ) ).map(
			( sentence ) => sentence.trim()
		);
		const blurbText = sentences.slice( 0, 2 ).join( ' ' ).trim();
		return blurbText.length > 200 ? `${ blurbText.slice( 0, 199 ).trimEnd() }…` : blurbText;
	},
};
