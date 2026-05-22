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

const DB_NAME = 'a4a-agent-studio-mock';
// Bumped past 2 because earlier prototype branches created a v2 DB on some
// machines; opening at v1 then threw `VersionError` and the whole mock fell
// back to in-memory only, so outputs vanished on reload. The upgrade handler
// is idempotent — it only creates stores that don't already exist.
const DB_VERSION = 3;
const PROJECTS_STORE = 'projects';
const OUTPUTS_STORE = 'outputs';

const emptyState: AgentStudioMockState = { projects: [], outputs: [] };

let cache: AgentStudioMockState = emptyState;
let initialized = false;
let initPromise: Promise< void > | null = null;
let dbPromise: Promise< IDBDatabase > | null = null;

const isBrowser = () => typeof window !== 'undefined' && !! window.indexedDB;

function openDb(): Promise< IDBDatabase > {
	if ( ! isBrowser() ) {
		return Promise.reject( new Error( 'IndexedDB unavailable' ) );
	}

	if ( dbPromise ) {
		return dbPromise;
	}

	dbPromise = new Promise( ( resolve, reject ) => {
		const request = window.indexedDB.open( DB_NAME, DB_VERSION );

		request.onupgradeneeded = () => {
			const db = request.result;

			if ( ! db.objectStoreNames.contains( PROJECTS_STORE ) ) {
				db.createObjectStore( PROJECTS_STORE, { keyPath: 'id' } );
			}

			if ( ! db.objectStoreNames.contains( OUTPUTS_STORE ) ) {
				const store = db.createObjectStore( OUTPUTS_STORE, { keyPath: 'id' } );
				store.createIndex( 'projectId', 'projectId' );
			}
		};

		request.onsuccess = () => resolve( request.result );
		request.onerror = () => reject( request.error );
	} );

	return dbPromise;
}

function readAllFromStore< T >( db: IDBDatabase, storeName: string ): Promise< T[] > {
	return new Promise( ( resolve, reject ) => {
		const transaction = db.transaction( storeName, 'readonly' );
		const request = transaction.objectStore( storeName ).getAll();

		request.onsuccess = () => resolve( request.result as T[] );
		request.onerror = () => reject( request.error );
	} );
}

async function persist( storeName: string, value: unknown ): Promise< void > {
	if ( ! isBrowser() ) {
		return;
	}

	try {
		const db = await openDb();
		const transaction = db.transaction( storeName, 'readwrite' );
		transaction.objectStore( storeName ).put( value );

		await new Promise< void >( ( resolve, reject ) => {
			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject( transaction.error );
			transaction.onabort = () => reject( transaction.error );
		} );
	} catch ( error ) {
		// Storage is only a local mock detail. The in-memory cache should still
		// let the client continue when IndexedDB is unavailable or over quota.
		// eslint-disable-next-line no-console
		console.error( `[agent-studio mock] ${ storeName } save failed:`, error );
	}
}

async function remove( storeName: string, id: string ): Promise< void > {
	if ( ! isBrowser() ) {
		return;
	}

	try {
		const db = await openDb();
		const transaction = db.transaction( storeName, 'readwrite' );
		transaction.objectStore( storeName ).delete( id );

		await new Promise< void >( ( resolve, reject ) => {
			transaction.oncomplete = () => resolve();
			transaction.onerror = () => reject( transaction.error );
			transaction.onabort = () => reject( transaction.error );
		} );
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( `[agent-studio mock] ${ storeName } delete failed:`, error );
	}
}

async function ensureInitialized(): Promise< void > {
	if ( initialized ) {
		return;
	}

	if ( initPromise ) {
		return initPromise;
	}

	initPromise = ( async () => {
		try {
			const db = await openDb();
			const [ projects, outputs ] = await Promise.all( [
				readAllFromStore< AgentStudioProject >( db, PROJECTS_STORE ),
				readAllFromStore< AgentStudioOutput >( db, OUTPUTS_STORE ),
			] );

			cache = { projects, outputs };
		} catch {
			cache = emptyState;
		} finally {
			initialized = true;
		}
	} )();

	return initPromise;
}

export async function __resetMockAgentStudioServiceForTests(): Promise< void > {
	cache = emptyState;
	initialized = false;
	initPromise = null;

	const db = dbPromise ? await dbPromise.catch( () => undefined ) : undefined;
	db?.close();
	dbPromise = null;

	if ( ! isBrowser() ) {
		return;
	}

	await new Promise< void >( ( resolve ) => {
		const request = window.indexedDB.deleteDatabase( DB_NAME );
		request.onsuccess = () => resolve();
		request.onerror = () => resolve();
		request.onblocked = () => resolve();
	} );
}

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
 */
const resolveGeneratingOutputs = async (): Promise< void > => {
	const now = Date.now();
	const changedOutputs: AgentStudioOutput[] = [];

	cache.outputs = cache.outputs.map( ( output ) => {
		if (
			output.status !== 'generating' ||
			now - new Date( output.createdAt ).getTime() < GENERATION_DURATION_MS
		) {
			return output;
		}

		const nextOutput = {
			...output,
			status: 'ready' as const,
			previewUrls: MOCK_PREVIEW_URLS,
			assetCount: deriveAssetCount( output.id ),
			updatedAt: new Date( now ).toISOString(),
		};

		changedOutputs.push( nextOutput );
		return nextOutput;
	} );

	await Promise.all( changedOutputs.map( ( output ) => persist( OUTPUTS_STORE, output ) ) );
};

/**
 * Resolves the default project that every deliverable lands in, creating it on
 * first use. The service owns this so the client never has to know a "Default"
 * project exists — when the wpcom endpoint replaces this mock, the server will
 * provision it the same way.
 * @returns The default project.
 */
const ensureDefaultProject = async (): Promise< AgentStudioProject > => {
	const existing = cache.projects.find( ( project ) => project.isDefault );

	if ( existing ) {
		return existing;
	}

	const now = new Date().toISOString();
	const project: AgentStudioProject = {
		id: makeProjectId(),
		name: __( 'Default' ),
		isDefault: true,
		createdAt: now,
		updatedAt: now,
	};

	cache = { ...cache, projects: [ project, ...cache.projects ] };
	await persist( PROJECTS_STORE, project );

	return project;
};

export const mockAgentStudioService: AgentStudioService = {
	async listProjects() {
		await ensureInitialized();

		return sortByUpdatedAt( cache.projects ).map( ( project ) =>
			summarizeProject( project, cache.outputs )
		);
	},

	async getProject( projectId ) {
		await ensureInitialized();
		return cache.projects.find( ( project ) => project.id === projectId );
	},

	async createProject( input: CreateAgentStudioProjectInput ) {
		await ensureInitialized();
		const now = new Date().toISOString();
		const project: AgentStudioProject = {
			id: makeProjectId(),
			name: input.name,
			clientName: input.clientName,
			brief: input.brief,
			createdAt: now,
			updatedAt: now,
		};

		cache = { ...cache, projects: [ project, ...cache.projects ] };
		await persist( PROJECTS_STORE, project );

		return project;
	},

	async deleteProject( projectId ) {
		await ensureInitialized();
		const removedOutputIds = cache.outputs
			.filter( ( output ) => output.projectId === projectId )
			.map( ( output ) => output.id );

		cache = {
			projects: cache.projects.filter( ( project ) => project.id !== projectId ),
			outputs: cache.outputs.filter( ( output ) => output.projectId !== projectId ),
		};

		await Promise.all( [
			remove( PROJECTS_STORE, projectId ),
			...removedOutputIds.map( ( outputId ) => remove( OUTPUTS_STORE, outputId ) ),
		] );
	},

	async listProjectOutputs( projectId ) {
		await ensureInitialized();
		await resolveGeneratingOutputs();

		return sortByUpdatedAt( cache.outputs.filter( ( output ) => output.projectId === projectId ) );
	},

	async listOutputs() {
		await ensureInitialized();
		const project = await ensureDefaultProject();
		await resolveGeneratingOutputs();

		return sortByUpdatedAt( cache.outputs.filter( ( output ) => output.projectId === project.id ) );
	},

	async createOutput( input: CreateAgentStudioOutputInput ) {
		await ensureInitialized();
		const project = await ensureDefaultProject();
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

		cache = { ...cache, outputs: [ output, ...cache.outputs ] };
		await persist( OUTPUTS_STORE, output );

		return output;
	},

	async deleteOutput( outputId ) {
		await ensureInitialized();
		cache = {
			...cache,
			outputs: cache.outputs.filter( ( output ) => output.id !== outputId ),
		};
		await remove( OUTPUTS_STORE, outputId );
	},
};
