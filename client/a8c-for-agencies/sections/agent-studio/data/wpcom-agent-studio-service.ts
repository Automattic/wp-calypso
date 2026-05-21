/**
 * Real wpcom `AgentStudioService`. Falls back to the mock for project
 * CRUD (no backend yet).
 */
import wpcom from 'calypso/lib/wp';
import { mockAgentStudioService } from './mock-agent-studio-service';
import type { AgentStudioOutput, AgentStudioService, CreateAgentStudioOutputInput } from '../types';

interface OutputsResponse {
	outputs: AgentStudioOutput[];
}

interface DeleteRunResponse {
	run_id: number;
	status: string;
	deleted: boolean;
}

interface CreateRunResponse {
	run_id: number;
	status: string;
}

const DEFAULT_ONE_PAGER_RECIPE = 'compose-one-pager-ela-v2';

const requireAgencyId = ( agencyId: number | undefined, method: string ): number => {
	if ( ! agencyId ) {
		throw new Error( `agentStudioService.${ method }(): missing agencyId` );
	}
	return agencyId;
};

// Backend can emit `'cancelled'`; collapse anything outside the UI's
// status union to `'failed'` so the card doesn't get stuck.
const normalizeStatus = ( status: string ): AgentStudioOutput[ 'status' ] => {
	if ( status === 'ready' || status === 'generating' || status === 'failed' ) {
		return status;
	}
	return 'failed';
};

const normalizeOutput = ( output: AgentStudioOutput ): AgentStudioOutput => ( {
	...output,
	status: normalizeStatus( output.status ),
} );

export const wpcomAgentStudioService: AgentStudioService = {
	listProjects() {
		return mockAgentStudioService.listProjects();
	},

	getProject( projectId: string ) {
		return mockAgentStudioService.getProject( projectId );
	},

	createProject( input ) {
		return mockAgentStudioService.createProject( input );
	},

	deleteProject( projectId: string ) {
		return mockAgentStudioService.deleteProject( projectId );
	},

	async listProjectOutputs( projectId: string ) {
		const outputs = await this.listOutputs();
		return outputs.filter( ( output ) => output.projectId === projectId );
	},

	async listOutputs( agencyId?: number ): Promise< AgentStudioOutput[] > {
		const id = requireAgencyId( agencyId, 'listOutputs' );
		const response: OutputsResponse = await wpcom.req.get( {
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ id }/a4a/outputs`,
		} );
		return ( response?.outputs ?? [] ).map( normalizeOutput );
	},

	async createOutput(
		input: CreateAgentStudioOutputInput,
		agencyId?: number
	): Promise< AgentStudioOutput > {
		if ( input.agentId !== 'one-pager' ) {
			return mockAgentStudioService.createOutput( input );
		}

		const id = requireAgencyId( agencyId, 'createOutput' );
		const title = input.title ?? '';
		const text = title ? `${ title }\n\n${ input.brief ?? '' }` : input.brief ?? '';

		// `brand` and `project_id` are omitted on purpose. The recipe's
		// abilities disagree on `brand`'s type so the only value that
		// satisfies all three is null. `project_id` would fail the
		// persist step's integer validation; the runs endpoint
		// auto-injects the agency default when it's missing.
		const recipeInput: Record< string, unknown > = {
			title,
			text,
			blurb: input.blurb ?? input.description,
			page_count: 2,
			seed: Math.floor( Math.random() * 1_000_000_000 ),
			image_urls: input.imageUrls ?? [],
			...( input.logoUrl && { logo_url: input.logoUrl } ),
			...( input.partnerLogoUrl && { partner_logo_url: input.partnerLogoUrl } ),
			...( input.partnerLogoOrder && { partner_logo_order: input.partnerLogoOrder } ),
			...( input.heroUrl && { hero_url: input.heroUrl } ),
		};

		const response: CreateRunResponse = await wpcom.req.post( {
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ id }/a4a/runs`,
			body: {
				recipe: input.recipe || DEFAULT_ONE_PAGER_RECIPE,
				input: recipeInput,
			},
		} );

		const now = new Date().toISOString();
		return {
			id: String( response.run_id ),
			projectId: input.projectId ?? '',
			title: input.title,
			description: input.description,
			agentName: input.agentName,
			deliverableType: input.deliverableType,
			status: 'generating',
			createdAt: now,
			updatedAt: now,
		};
	},

	async deleteOutput( outputId: string, agencyId?: number ): Promise< void > {
		const id = requireAgencyId( agencyId, 'deleteOutput' );
		// `wpcom.req.del` doesn't override the HTTP method, so it goes
		// out as POST and the v2 DELETETABLE route 404s.
		await wpcom.req.post< DeleteRunResponse >( {
			method: 'DELETE',
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ id }/a4a/runs/${ outputId }`,
		} );
	},
};
