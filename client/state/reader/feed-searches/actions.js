/**
 * Internal dependencies
 */
import {
	READER_FEED_SEARCH_REQUEST,
	READER_FEED_SEARCH_RECEIVE,
} from 'state/action-types';

export const requestFeedSearch = ( query ) => ( {
	type: READER_FEED_SEARCH_REQUEST,
	payload: { query },
} );

export const receiveFeedSearch = ( query, feeds ) => ( {
	type: READER_FEED_SEARCH_RECEIVE,
	payload: feeds,
	query,
} );
