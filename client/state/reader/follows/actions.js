/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import wpcom from 'lib/wp';
import {
	READER_FOLLOW,
	READER_UNFOLLOW,
	READER_FOLLOWS_RECEIVE,
	READER_FOLLOWS_REQUEST,
	READER_FOLLOWS_REQUEST_SUCCESS,
	READER_FOLLOWS_REQUEST_FAILURE,
} from 'state/action-types';

/**
 * Module variables
 */
const debug = debugModule( 'calypso:redux:reader-follows' );

/**
 * Returns an action object to signal that a URL has been followed.
 *
 * @param  {String} url Followed URL
 * @return {Function} Action thunk
 */
export function recordFollow( url ) {
	return ( dispatch ) => {
		debug( 'User followed ' + url );
		dispatch( {
			type: READER_FOLLOW,
			payload: { url }
		} );
	};
}

/**
 * Returns an action object to signal that a URL has been unfollowed.
 *
 * @param  {String} url Unfollowed URL
 * @return {Function} Action thunk
 */
export function recordUnfollow( url ) {
	return ( dispatch ) => {
		debug( 'User unfollowed ' + url );
		dispatch( {
			type: READER_UNFOLLOW,
			payload: { url }
		} );
	};
}

/**
 * Returns an action object to signal that followed sites have been received.
 *
 * @param  {Array}  follows Follows received
 * @return {Object} 		Action object
 */
export function receiveFollows( follows ) {
	return {
		type: READER_FOLLOWS_RECEIVE,
		payload: { follows }
	};
}

/**
 * Triggers a network request to fetch user's followed sites.
 *
 * @param  {Integer} page Page number of results
 * @param  {Integer} limit Maximum number of results to return
 * @return {Function} Action thunk
 */
export function requestFollows( page = 1, limit = 5 ) {
	return ( dispatch ) => {
		dispatch( {
			type: READER_FOLLOWS_REQUEST
		} );

		const query = {
			page,
			number: limit
		};

		return wpcom.undocumented().readFollowingMine( query ).then( ( payload ) => {
			dispatch( receiveFollows( payload.subscriptions ) );
			dispatch( {
				type: READER_FOLLOWS_REQUEST_SUCCESS,
				payload
			} );
		},
		( error ) => {
			dispatch( {
				type: READER_FOLLOWS_REQUEST_FAILURE,
				payload: error,
				error: true,
			} );
		}
		);
	};
}

