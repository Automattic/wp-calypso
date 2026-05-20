import wpcom from 'calypso/lib/wp';
import type {
	AgentStudioOutput,
	AgentStudioOutputStatus,
	AgentStudioProject,
	AgentStudioProjectSummary,
	AgentStudioService,
	CreateAgentStudioOutputInput,
	OnePagerContentField,
} from '../types';

interface MediaUploadResponse {
	url: string;
}

interface RunDispatchResponse {
	run_id: string | number;
	status?: string;
}

interface ListOutputsResponse {
	outputs: AgentStudioOutput[];
}

const agencyPath = ( agencyId: number, path: string ) =>
	`/agency/${ agencyId }/a4a${ path.startsWith( '/' ) ? path : `/${ path }` }`;

const toStatus = ( status: string | undefined ): AgentStudioOutputStatus => {
	if ( status === 'ready' || status === 'failed' ) {
		return status;
	}
	return 'generating';
};

/**
 * Uploads a single image to the agency's shared media bucket and returns the
 * URL the renderer can fetch. The endpoint accepts one file at a time so each
 * image is posted in series.
 * @param agencyId - The active agency id.
 * @param file - The image to upload.
 * @returns The hosted URL of the uploaded image.
 */
const uploadMedia = async ( agencyId: number, file: File ): Promise< string > => {
	const formData = new FormData();
	formData.append( 'media', file );

	const response: MediaUploadResponse = await wpcom.req.post( {
		apiNamespace: 'wpcom/v2',
		path: agencyPath( agencyId, '/media' ),
		body: formData,
	} );

	return response.url;
};

const notImplemented = ( name: string ) =>
	new Error(
		`${ name } is not implemented on wpcomAgentStudioService; projects are server-managed`
	);

export const wpcomAgentStudioService: AgentStudioService = {
	// Legacy project surface — unreachable from the active UI. The server
	// auto-provisions a "Default" project per agency, so the client never
	// touches projects directly.
	listProjects(): Promise< AgentStudioProjectSummary[] > {
		return Promise.resolve( [] );
	},

	getProject(): Promise< AgentStudioProject | undefined > {
		return Promise.resolve( undefined );
	},

	createProject(): Promise< AgentStudioProject > {
		return Promise.reject( notImplemented( 'createProject' ) );
	},

	deleteProject(): Promise< void > {
		return Promise.reject( notImplemented( 'deleteProject' ) );
	},

	listProjectOutputs(): Promise< AgentStudioOutput[] > {
		return Promise.resolve( [] );
	},

	async listOutputs( agencyId: number ): Promise< AgentStudioOutput[] > {
		const response: ListOutputsResponse = await wpcom.req.get( {
			apiNamespace: 'wpcom/v2',
			path: agencyPath( agencyId, '/outputs' ),
		} );

		return response.outputs ?? [];
	},

	async createOutput(
		agencyId: number,
		input: CreateAgentStudioOutputInput
	): Promise< AgentStudioOutput > {
		// Step 1: upload the cover image, if one was provided. The recipe today
		// only consumes `hero_url` — additional files are dropped (see the
		// migration doc's "Deferred gaps" → multi-image support).
		const heroUrl = input.images.length > 0 ? await uploadMedia( agencyId, input.images[ 0 ] ) : '';

		// Step 2: dispatch the recipe. `project_id` is omitted so the server
		// resolves the Default project for this agency.
		const runResponse: RunDispatchResponse = await wpcom.req.post( {
			apiNamespace: 'wpcom/v2',
			path: agencyPath( agencyId, '/runs' ),
			body: {
				recipe: 'compose-one-pager',
				input: {
					text: input.brief,
					blurb: input.blurb,
					hero_url: heroUrl,
				},
			},
		} );

		// Step 3: synthesize the row the caller will optimistically render
		// while the polling tick waits for the projection to catch up.
		const now = new Date().toISOString();
		return {
			id: String( runResponse.run_id ),
			projectId: '',
			title: input.title,
			description: input.description,
			agentName: input.agentName,
			deliverableType: input.deliverableType,
			status: toStatus( runResponse.status ),
			createdAt: now,
			updatedAt: now,
		};
	},

	async deleteOutput( agencyId: number, outputId: string ): Promise< void > {
		await wpcom.req.post( {
			method: 'DELETE',
			apiNamespace: 'wpcom/v2',
			path: agencyPath( agencyId, `/runs/${ outputId }` ),
		} );
	},

	async suggestOnePagerContent( brief: string, field: OnePagerContentField ): Promise< string > {
		// TODO: real suggest endpoint — see docs/api-migration.md "Deferred gaps".
		// Heuristic stand-in for the AI suggestion: the first line tends to be
		// the headline, the sentences after it frame the document.
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

export const agentStudioService: AgentStudioService = wpcomAgentStudioService;
