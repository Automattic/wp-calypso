/**
 * External dependencies
 */
import wpcom from 'lib/wp';

/**
 * Internal dependencies
 */
import {
	READER_FEED_SEARCH_REQUEST,
	READER_FEED_SEARCH_FAILURE,
	READER_FEED_SEARCH_SUCCESS,
	READER_FEED_SEARCH_RECIEVE,
} from 'state/action-types';

//import debugModule from 'debug';

/**
 * Module variables
 */
//const debug = debugModule( 'calypso:redux:reader-feed-search' );

/**
 * Returns an action object to signal that the result of a query has been received.
 *
 * @param {String} query the query typed in the search box
 * @param {Array} feeds a list of feed objects that should be associated with the query
 * @return {Object} Action object
 */
export function receiveFeedSearch( query, feeds ) {
	return {
		type: READER_FEED_SEARCH_RECIEVE,
		query,
		feeds,
	};
}

function requestSuccessful( query ) {
	return {
		type: READER_FEED_SEARCH_SUCCESS,
		query,
	};
}

function requestFailure( query ) {
	return {
		type: READER_FEED_SEARCH_FAILURE,
		query
	};
}

/**
 * Request a feed search.  Triggers a network request if result isn't cached
 *
 * @param  {String} query - the query to search for
 * @return {Function} Action thunk
 */
export const requestFeedSearch = ( query ) => ( dispatch ) => {
	dispatch( {
		type: READER_FEED_SEARCH_REQUEST,
		query
	} );

	wpcom.undocumented().discoverFeed( { q: query } )
		.then( response => {
			dispatch( requestSuccessful( query ) );
			dispatch( receiveFeedSearch( query, response.feeds ) );
		} )
		.catch( () => {
			dispatch( requestFailure( query ) );
		} );
};
