/**
 * Internal dependencies
 */
import {
	READER_FEED_SEARCH_REQUEST,
	READER_FEED_SEARCH_RECEIVE,
} from 'state/action-types';

// 	wpcom.undocumented().discoverFeed( { q: query } )
//  +		.then( response => {
//  +			dispatch( requestSuccessful( query ) );
//  +			dispatch( receiveFeedSearch( query, response.feeds ) );
//  +		} )
//  +		.catch( () => {
//  +			dispatch( requestFailure( query ) );
//  +		} );
export const requestFeedSearch = ( query ) => ( {
	type: READER_FEED_SEARCH_REQUEST,
	payload: { query },
} );

export const receiveFeedSearch = ( feeds ) => ( {
	type: READER_FEED_SEARCH_RECEIVE,
	payload: feeds
} );
