import {
	READER_RECOMMENDED_SITE_DISMISSED,
	READER_RECOMMENDED_SITES_REQUEST,
	READER_RECOMMENDED_SITES_RECEIVE,
	READER_RECOMMENDED_SITE_FOLLOWED,
} from 'calypso/state/reader/action-types';
import 'calypso/state/data-layer/wpcom/read/recommendations/sites';
import 'calypso/state/reader/init';
import { RecommendedSite } from './types';

export const requestRecommendedSites = ( { offset = 0, number = 4, seed = 0 } ) => ( {
	type: READER_RECOMMENDED_SITES_REQUEST,
	payload: { offset, number, seed },
} );

export const receiveRecommendedSites = ( {
	seed,
	sites,
	offset = 0,
}: {
	seed: number;
	sites: RecommendedSite[];
	offset?: number;
} ) => ( {
	type: READER_RECOMMENDED_SITES_RECEIVE,
	payload: { sites, offset },
	seed,
} );

export const dismissedRecommendedSite = ( {
	siteId,
	seed,
}: {
	siteId: number;
	seed: number;
} ) => ( {
	type: READER_RECOMMENDED_SITE_DISMISSED,
	payload: { siteId },
	seed,
} );

export const followedRecommendedSite = ( { siteId, seed }: { siteId: number; seed: number } ) => ( {
	type: READER_RECOMMENDED_SITE_FOLLOWED,
	payload: { siteId },
	seed,
} );
