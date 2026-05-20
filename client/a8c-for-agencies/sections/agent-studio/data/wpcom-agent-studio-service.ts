/**
 * Real wpcom implementation of `AgentStudioService`, wired to the
 * A4A endpoints in `wp-content/rest-api-plugins/centralized/agency/`:
 *
 *   GET    /wpcom/v2/agency/<agency_id>/a4a/outputs          → flat list
 *   POST   /wpcom/v2/agency/<agency_id>/a4a/runs             → start a run
 *   DELETE /wpcom/v2/agency/<agency_id>/a4a/runs/<run_id>    → cancel / delete
 *
 * The one-pager flow targets the `compose-one-pager-ela-v2` recipe —
 * see ADR-0001 in `~/Projects/wpcom-specs/a4a-agent-studio-real-api/`.
 *
 * Project CRUD and `suggestOnePagerContent` are not implemented here;
 * they fall back to the mock service for now. Project wiring is a
 * separate follow-up PR; suggest content has no backend yet.
 *
 * `agencyId` is passed in from the calling hook (which reads
 * `getActiveAgencyId` via `useSelector` in the React Query queryFn
 * wrapper) rather than resolved here — the service is called from
 * React Query's `queryFn`, which has no component context for Redux.
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

/**
 * The one-pager recipe Calypso fires by default. See ADR-0001 in
 * `~/Projects/wpcom-specs/a4a-agent-studio-real-api/docs/adr/` for the
 * rationale. Switching back to baseline `compose-one-pager` is a
 * one-line change here.
 */
const DEFAULT_ONE_PAGER_RECIPE = 'compose-one-pager-ela-v2';

const requireAgencyId = ( agencyId: number | undefined, method: string ): number => {
	if ( ! agencyId ) {
		throw new Error( `agentStudioService.${ method }(): missing agencyId` );
	}
	return agencyId;
};

/**
 * Backend may emit `'cancelled'` (a terminal projection status) but the
 * UI only knows `ready | generating | failed`. Collapse to `failed` so
 * the card renders a stable error tile instead of getting stuck.
 */
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
		// Only one-pager is wired to a real recipe today. Other agents
		// stay on the mock until their recipes ship.
		if ( input.agentId !== 'one-pager' ) {
			return mockAgentStudioService.createOutput( input );
		}

		const id = requireAgencyId( agencyId, 'createOutput' );
		const title = input.title ?? '';
		// `compose-one-pager-ela-v2` reads `input.title` directly; we
		// also include the title at the top of `text` so the layout
		// director sees it in the source as a heading.
		const text = title ? `${ title }\n\n${ input.brief ?? '' }` : input.brief ?? '';

		const recipeInput: Record< string, unknown > = {
			title,
			text,
			blurb: input.blurb ?? input.description,
			page_count: 2,
			seed: Math.floor( Math.random() * 1_000_000_000 ),
			image_urls: input.imageUrls ?? [],
			brand: 'automattic',
		};

		if ( input.logoUrl ) {
			recipeInput.logo_url = input.logoUrl;
		}
		if ( input.partnerLogoUrl ) {
			recipeInput.partner_logo_url = input.partnerLogoUrl;
		}
		if ( input.partnerLogoOrder ) {
			recipeInput.partner_logo_order = input.partnerLogoOrder;
		}
		if ( input.heroUrl ) {
			recipeInput.hero_url = input.heroUrl;
		}
		if ( input.projectId ) {
			recipeInput.project_id = input.projectId;
		}

		const response: CreateRunResponse = await wpcom.req.post( {
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ id }/a4a/runs`,
			body: {
				recipe: input.recipe || DEFAULT_ONE_PAGER_RECIPE,
				input: recipeInput,
			},
		} );

		// POST returns `{ run_id, status: a4a_pending|a4a_running }`. Build
		// a synthetic AgentStudioOutput from the form input so the card
		// flips to "generating" immediately; the polling refetch off
		// /a4a/outputs replaces it with the real projection.
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
		// `wpcom.req.del` is a thin shim around `req.post` that does NOT
		// override the HTTP method, so the request goes out as POST and
		// the v2 DELETETABLE route 404s. Use `req.post` with an explicit
		// `method: 'DELETE'`.
		await wpcom.req.post< DeleteRunResponse >( {
			method: 'DELETE',
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ id }/a4a/runs/${ outputId }`,
		} );
	},

	suggestOnePagerContent( brief: string, field ) {
		return mockAgentStudioService.suggestOnePagerContent( brief, field );
	},
};
