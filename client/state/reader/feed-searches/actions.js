/**
 * Internal dependencies
 */
import {
	READER_FEED_SEARCH_REQUEST,
	READER_FEED_SEARCH_RECEIVE,
} from 'state/action-types';

export const requestFeedSearch = ( query, offset = 0 ) => ( {
	type: READER_FEED_SEARCH_REQUEST,
	payload: { query, offset },
} );

export const receiveFeedSearch = ( query, feeds ) => ( {
	type: READER_FEED_SEARCH_RECEIVE,
	payload: feeds,
	query,
} );
