export type DifmOfferSource = 'home' | 'site-overview' | 'site-setup' | 'themes';

/**
 * The DIFM offer experiment's copy arms. The names match the ExPlat variations.
 */
export const DIFM_OFFER_ARMS = [ 'expert_help', 'no_time_to_build', 'skip_the_setup' ] as const;

export type DifmOfferBuildRequestVariation = ( typeof DIFM_OFFER_ARMS )[ number ];

export interface DifmOfferBuildRequest {
	description: string;
	name?: string;
	source: DifmOfferSource;
	variation: DifmOfferBuildRequestVariation;
}

export interface DifmOfferBuildRequestResponse {
	success: boolean;
}
