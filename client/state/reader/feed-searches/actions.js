/**
 * Internal dependencies
 */
import { READER_FEED_SEARCH_REQUEST, READER_FEED_SEARCH_RECEIVE } from 'state/action-types';

export const requestFeedSearch = ( query, offset = 0 ) => ( {
	type: READER_FEED_SEARCH_REQUEST,
	payload: {
		query: query.substring( 0, 500 ),
		offset,
	},
} );

export const receiveFeedSearch = ( query, feeds, total ) => ( {
	type: READER_FEED_SEARCH_RECEIVE,
	payload: { feeds, total },
	query,
} );
