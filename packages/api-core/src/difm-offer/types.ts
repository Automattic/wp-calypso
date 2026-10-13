export type DifmOfferSource = 'home' | 'site-overview' | 'themes';

export type DifmOfferBuildRequestVariation = 'treatment';

export interface DifmOfferBuildRequest {
	description: string;
	name?: string;
	source: DifmOfferSource;
	variation: DifmOfferBuildRequestVariation;
}

export interface DifmOfferBuildRequestResponse {
	success: boolean;
}
