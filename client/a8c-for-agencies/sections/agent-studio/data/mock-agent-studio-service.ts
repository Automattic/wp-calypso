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
	UpdateAgentStudioOutputInput,
} from '../types';

// IndexedDB-backed mock store, matching the prototype's lib/storage.ts shape.
// Two object stores keyed by id (projects + outputs); large blobs like the
// rendered HTML pages and image data URLs live on each output row so a single
// localStorage value never has to hold them all. When the wpcom endpoint
// replaces this mock, the server will provision the same shape.

const DB_NAME = 'a4a-agent-studio-mock';
const DB_VERSION = 1;
const PROJECTS_STORE = 'projects';
const OUTPUTS_STORE = 'outputs';

interface MockState {
	projects: AgentStudioProject[];
	outputs: AgentStudioOutput[];
}

const emptyState: MockState = { projects: [], outputs: [] };

let cache: MockState = emptyState;
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
		const req = window.indexedDB.open( DB_NAME, DB_VERSION );
		req.onupgradeneeded = () => {
			const db = req.result;
			if ( ! db.objectStoreNames.contains( PROJECTS_STORE ) ) {
				db.createObjectStore( PROJECTS_STORE, { keyPath: 'id' } );
			}
			if ( ! db.objectStoreNames.contains( OUTPUTS_STORE ) ) {
				const store = db.createObjectStore( OUTPUTS_STORE, { keyPath: 'id' } );
				store.createIndex( 'projectId', 'projectId' );
			}
		};
		req.onsuccess = () => resolve( req.result );
		req.onerror = () => reject( req.error );
	} );
	return dbPromise;
}

function readAllFromStore< T >( db: IDBDatabase, storeName: string ): Promise< T[] > {
	return new Promise( ( resolve, reject ) => {
		const tx = db.transaction( storeName, 'readonly' );
		const req = tx.objectStore( storeName ).getAll();
		req.onsuccess = () => resolve( req.result as T[] );
		req.onerror = () => reject( req.error );
	} );
}

async function persist( storeName: string, value: unknown ): Promise< void > {
	try {
		const db = await openDb();
		const tx = db.transaction( storeName, 'readwrite' );
		tx.objectStore( storeName ).put( value );
		await new Promise< void >( ( resolve, reject ) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject( tx.error );
			tx.onabort = () => reject( tx.error );
		} );
	} catch ( err ) {
		// eslint-disable-next-line no-console
		console.error( `[agent-studio mock] ${ storeName } save failed:`, err );
	}
}

async function remove( storeName: string, id: string ): Promise< void > {
	try {
		const db = await openDb();
		const tx = db.transaction( storeName, 'readwrite' );
		tx.objectStore( storeName ).delete( id );
		await new Promise< void >( ( resolve, reject ) => {
			tx.oncomplete = () => resolve();
			tx.onerror = () => reject( tx.error );
			tx.onabort = () => reject( tx.error );
		} );
	} catch ( err ) {
		// eslint-disable-next-line no-console
		console.error( `[agent-studio mock] ${ storeName } delete failed:`, err );
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
		} catch ( err ) {
			// eslint-disable-next-line no-console
			console.error( '[agent-studio mock] init failed:', err );
			cache = { projects: [], outputs: [] };
		} finally {
			initialized = true;
		}
	} )();
	return initPromise;
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

// How long a non-one-pager deliverable stays in the "generating" state
// before the mock resolves it with placeholder assets. The one-pager kind
// runs real client-side generation and writes its result back via
// updateOutput, so it bypasses this auto-resolution path.
const GENERATION_DURATION_MS = 6000;

const MOCK_PREVIEW_URLS = [ socialAssetsPreview, onePagerPreview, eventAssetsPreview ];

const deriveAssetCount = ( outputId: string ): number => {
	let hash = 0;
	for ( let i = 0; i < outputId.length; i++ ) {
		hash = ( hash * 31 + outputId.charCodeAt( i ) ) >>> 0;
	}
	return 12 + ( hash % 61 );
};

/**
 * Flips any non-one-pager deliverable that has been generating past the
 * auto-resolution window into a ready state with mock previews. Persists each
 * flipped row.
 */
async function resolveGeneratingOutputs(): Promise< void > {
	const now = Date.now();
	const toResolve: AgentStudioOutput[] = [];
	for ( const output of cache.outputs ) {
		if ( output.kind === 'one-pager' ) {
			continue;
		}
		if (
			output.status !== 'generating' ||
			now - new Date( output.createdAt ).getTime() < GENERATION_DURATION_MS
		) {
			continue;
		}
		toResolve.push( output );
	}
	if ( toResolve.length === 0 ) {
		return;
	}
	for ( const output of toResolve ) {
		const next: AgentStudioOutput = {
			...output,
			status: 'ready',
			previewUrls: MOCK_PREVIEW_URLS,
			assetCount: deriveAssetCount( output.id ),
			updatedAt: new Date( now ).toISOString(),
		};
		const idx = cache.outputs.findIndex( ( o ) => o.id === output.id );
		if ( idx >= 0 ) {
			cache.outputs[ idx ] = next;
		}
		await persist( OUTPUTS_STORE, next );
	}
}

async function ensureDefaultProject(): Promise< AgentStudioProject > {
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
	cache.projects = [ project, ...cache.projects ];
	await persist( PROJECTS_STORE, project );
	return project;
}

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
		cache.projects = [ project, ...cache.projects ];
		await persist( PROJECTS_STORE, project );
		return project;
	},

	async deleteProject( projectId ) {
		await ensureInitialized();
		cache.projects = cache.projects.filter( ( project ) => project.id !== projectId );
		const orphans = cache.outputs.filter( ( output ) => output.projectId === projectId );
		cache.outputs = cache.outputs.filter( ( output ) => output.projectId !== projectId );
		await remove( PROJECTS_STORE, projectId );
		await Promise.all( orphans.map( ( output ) => remove( OUTPUTS_STORE, output.id ) ) );
	},

	async listProjectOutputs( projectId ) {
		await ensureInitialized();
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
			kind: input.kind,
			status: 'generating',
			createdAt: now,
			updatedAt: now,
		};
		cache.outputs = [ output, ...cache.outputs ];
		await persist( OUTPUTS_STORE, output );
		return output;
	},

	async getOutput( outputId ) {
		await ensureInitialized();
		await resolveGeneratingOutputs();
		return cache.outputs.find( ( output ) => output.id === outputId );
	},

	async updateOutput( outputId: string, updates: UpdateAgentStudioOutputInput ) {
		await ensureInitialized();
		const existing = cache.outputs.find( ( output ) => output.id === outputId );
		if ( ! existing ) {
			return undefined;
		}
		const now = new Date().toISOString();
		const next: AgentStudioOutput = {
			...existing,
			...updates,
			updatedAt: now,
		};
		cache.outputs = cache.outputs.map( ( output ) => ( output.id === outputId ? next : output ) );
		await persist( OUTPUTS_STORE, next );
		return next;
	},

	async deleteOutput( outputId ) {
		await ensureInitialized();
		cache.outputs = cache.outputs.filter( ( output ) => output.id !== outputId );
		await remove( OUTPUTS_STORE, outputId );
	},

	async suggestOnePagerContent( brief, field ) {
		return _suggestOnePagerContent( brief, field );
	},
};

/**
 * Test-only: resets the in-memory cache and closes any open IDB connection,
 * so the next call re-opens the database fresh. Used by the unit tests to
 * isolate each case without touching internal module state directly.
 */
export async function __resetMockAgentStudioServiceForTests(): Promise< void > {
	if ( dbPromise ) {
		try {
			const db = await dbPromise;
			db.close();
		} catch {
			// Best effort.
		}
	}
	dbPromise = null;
	cache = { projects: [], outputs: [] };
	initialized = false;
	initPromise = null;
	if ( typeof window !== 'undefined' && window.indexedDB ) {
		await new Promise< void >( ( resolve ) => {
			const req = window.indexedDB.deleteDatabase( DB_NAME );
			req.onsuccess = () => resolve();
			req.onerror = () => resolve();
			req.onblocked = () => resolve();
		} );
	}
}

async function _suggestOnePagerContent(
	brief: string,
	field: 'title' | 'blurb'
): Promise< string > {
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
}
