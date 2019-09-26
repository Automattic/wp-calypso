/**
 * Internal dependencies
 */
import {
	READER_RECOMMENDED_SITES_REQUEST,
	READER_RECOMMENDED_SITES_RECEIVE,
} from 'state/action-types';

import 'state/data-layer/wpcom/read/recommendations/sites';

export const requestRecommendedSites = ( { offset = 0, number = 4, seed = 0 } ) => ( {
	type: READER_RECOMMENDED_SITES_REQUEST,
	payload: { offset, number, seed },
} );

export const receiveRecommendedSites = ( { seed, sites, offset = 0 } ) => ( {
	type: READER_RECOMMENDED_SITES_RECEIVE,
	payload: { sites, offset },
	seed,
} );
