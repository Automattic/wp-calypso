export type DifmOfferSource = 'home' | 'site-overview' | 'themes';

export type DifmOfferBuildRequestVariation = 'skip_setup' | 'expert_help' | 'no_time';

export interface DifmOfferBuildRequest {
	description: string;
	name?: string;
	source: DifmOfferSource;
	variation: DifmOfferBuildRequestVariation;
}

export interface DifmOfferBuildRequestResponse {
	success: boolean;
}
