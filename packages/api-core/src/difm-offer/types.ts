export type DifmOfferSource = 'home' | 'site-overview' | 'site-setup' | 'themes';

export type DifmOfferBuildRequestVariation = 'expert_help' | 'no_time_to_build' | 'skip_the_setup';

export interface DifmOfferBuildRequest {
	description: string;
	name?: string;
	source: DifmOfferSource;
	variation: DifmOfferBuildRequestVariation;
}

export interface DifmOfferBuildRequestResponse {
	success: boolean;
}
