import type { Railcar } from '@automattic/calypso-analytics';

export interface ReadSiteRecommendationsQueryParams {
	number?: number;
	offset?: number;
	seed?: number;
}

export interface ReadSiteRecommendationResponse {
	blog_id: number;
	blog_title?: string;
	blog_url?: string;
	description: string;
	feed_id: number;
	feed_url: string;
	icon?: {
		ico?: string;
		img?: string;
		media_id?: string | number;
	};
	ID: number;
	name: string;
	railcar?: Partial< Railcar >;
	URL: string;
}

export interface ReadSiteRecommendationsResponse {
	algorithm: string;
	sites: ReadSiteRecommendationResponse[];
	meta?: {
		next_page?: string;
	};
}

export interface ReadSiteRecommendation {
	algorithm: string;
	blogId: number;
	description: string;
	feedId: number;
	feedUrl: string;
	icon?: string;
	railcar?: Partial< Railcar >;
	title: string;
	url: string;
}
