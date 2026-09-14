import wpcom from 'calypso/lib/wp';
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
const SOCIAL_CAMPAIGN_RECIPE = 'compose-social-campaign-v1';

// `deliverableType` on the agent definition is a translated display
// label ("Social assets", "PDF"). The server-side projection on the
// outputs endpoint returns slugs ("social-assets", "one-pager"). The
// deliverable-page router branches on those slugs, so the optimistic
// output we return at submit time has to use the slug too — otherwise
// `output-detail-content.tsx` picks the wrong renderer between submit
// and the next outputs refetch, and the social deliverable flashes
// "No preview is available" until the user refreshes the page.
const AGENT_ID_TO_DELIVERABLE_SLUG: Record< string, string > = {
	'one-pager': 'one-pager',
	'social-assets': 'social-assets',
};

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
	async listOutputs( agencyId?: number ): Promise< AgentStudioOutput[] > {
		const id = requireAgencyId( agencyId, 'listOutputs' );
		const response = await wpcom.req.get< OutputsResponse >( {
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ id }/a4a/outputs`,
		} );
		return ( response?.outputs ?? [] ).map( normalizeOutput );
	},

	async createOutput(
		input: CreateAgentStudioOutputInput,
		agencyId?: number
	): Promise< AgentStudioOutput > {
		const id = requireAgencyId( agencyId, 'createOutput' );

		let recipe: string;
		let recipeInput: Record< string, unknown >;

		if ( input.agentId === 'social-assets' ) {
			recipe = input.recipe || SOCIAL_CAMPAIGN_RECIPE;
			recipeInput = {
				headline: input.headline ?? input.title ?? '',
				stat: input.stat ?? '',
				stat_context: input.statContext ?? '',
				image_urls: input.socialImageUrls ?? [],
				...( input.socialLogoUrl && { logo_url: input.socialLogoUrl } ),
				...( input.socialLogoLightUrl && { logo_light_url: input.socialLogoLightUrl } ),
			};
		} else {
			const title = input.title ?? '';
			const text = title ? `${ title }\n\n${ input.brief ?? '' }` : input.brief ?? '';

			// `brand` and `project_id` are omitted on purpose. The recipe's
			// abilities disagree on `brand`'s type so the only value that
			// satisfies all three is null. `project_id` would fail the
			// persist step's integer validation; the runs endpoint
			// auto-injects the agency default when it's missing.
			recipe = input.recipe || DEFAULT_ONE_PAGER_RECIPE;
			recipeInput = {
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
		}

		const response: CreateRunResponse = await wpcom.req.post( {
			apiNamespace: 'wpcom/v2',
			path: `/agency/${ id }/a4a/runs`,
			body: {
				recipe,
				input: recipeInput,
			},
		} );

		const now = new Date().toISOString();
		return {
			id: String( response.run_id ),
			title: input.title,
			description: input.description,
			agentName: input.agentName,
			deliverableType: AGENT_ID_TO_DELIVERABLE_SLUG[ input.agentId ] ?? input.deliverableType,
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
