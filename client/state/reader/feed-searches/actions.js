/**
 * Internal dependencies
 */
import { READER_FEED_SEARCH_REQUEST, READER_FEED_SEARCH_RECEIVE } from 'state/action-types';

import 'state/data-layer/wpcom/read/feed';

import 'state/reader/reducer';

export const SORT_BY_LAST_UPDATED = 'last_updated';
export const SORT_BY_RELEVANCE = 'relevance';

export const requestFeedSearch = ( {
	query,
	offset = 0,
	excludeFollowed = true,
	sort = SORT_BY_RELEVANCE,
} ) => ( {
	type: READER_FEED_SEARCH_REQUEST,
	payload: {
		query: query.substring( 0, 500 ),
		offset,
		excludeFollowed,
		sort,
	},
} );

export const receiveFeedSearch = ( queryKey, feeds, total ) => ( {
	type: READER_FEED_SEARCH_RECEIVE,
	payload: { feeds, total },
	queryKey,
} );
