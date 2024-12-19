import {
	READER_RECOMMENDED_SITE_DISMISSED,
	READER_RECOMMENDED_SITES_REQUEST,
	READER_RECOMMENDED_SITES_RECEIVE,
	READER_RECOMMENDED_SITE_FOLLOWED,
} from 'calypso/state/reader/action-types';
import type { RecommendedSite } from 'calypso/state/data-layer/wpcom/read/recommendations/sites';
import 'calypso/state/reader/init';
import 'calypso/state/data-layer/wpcom/read/recommendations/sites';

export interface RecommendedSitesRequestAction {
	type: 'READER_RECOMMENDED_SITES_REQUEST';
	payload: RecommendedSitesRequestPayload;
}

interface RecommendedSitesRequestPayload {
	offset: number;
	number: number;
	seed: number;
}

export const requestRecommendedSites = ( {
	offset = 0,
	number = 4,
	seed = 0,
}: {
	offset?: number;
	number?: number;
	seed?: number;
} ): RecommendedSitesRequestAction => ( {
	type: READER_RECOMMENDED_SITES_REQUEST,
	payload: { offset, number, seed },
} );

export interface RecommendedSitesReceiveAction {
	type: 'READER_RECOMMENDED_SITES_RECEIVE';
	payload: {
		offset?: number;
		sites: RecommendedSite[];
	};
	seed: number;
}

export const receiveRecommendedSites = ( {
	seed,
	sites,
	offset = 0,
}: {
	seed: number;
	sites: RecommendedSite[];
	offset?: number;
} ): RecommendedSitesReceiveAction => ( {
	type: READER_RECOMMENDED_SITES_RECEIVE,
	payload: { sites, offset },
	seed,
} );

export interface RecommendedSiteDismissedAction {
	type: 'READER_RECOMMENDED_SITE_DISMISSED';
	payload: {
		siteId: number;
	};
	seed: number;
}

export const dismissedRecommendedSite = ( {
	siteId,
	seed,
}: {
	siteId: number;
	seed: number;
} ): RecommendedSiteDismissedAction => ( {
	type: READER_RECOMMENDED_SITE_DISMISSED,
	payload: { siteId },
	seed,
} );

export interface RecommendedSiteFollowedAction {
	type: 'READER_RECOMMENDED_SITE_FOLLOWED';
	payload: {
		siteId: number;
	};
	seed: number;
}

export const followedRecommendedSite = ( {
	siteId,
	seed,
}: {
	siteId: number;
	seed: number;
} ): RecommendedSiteFollowedAction => ( {
	type: READER_RECOMMENDED_SITE_FOLLOWED,
	payload: { siteId },
	seed,
} );
