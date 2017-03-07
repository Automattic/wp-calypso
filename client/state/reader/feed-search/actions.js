/**
 * Internal dependencies
 */
import {
	READER_FEED_SEARCH_REQUEST,
	READER_FEED_SEARCH_RECEIVE,
} from 'state/action-types';

// // return wpcom.undocumented().readFeed( { ID: feedId } )
// 		var params = omit(query, 'ID');
// 		debug('/read/feed');
// 		return this.wpcom.req.get('/read/feed/' + encodeURIComponent(query.ID), params, fn);
export const requestFeedSearch = ( feedId ) => ( {
	type: READER_FEED_SEARCH_REQUEST,
	payload: { feedId },
} );

export const receiveFeedSearch = ( feeds ) => ( {
	type: READER_FEED_SEARCH_RECEIVE,
	payload: feeds
} );
