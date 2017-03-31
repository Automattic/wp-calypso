/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_UNFOLLOW,
	READER_FOLLOWS_RECEIVE,
	READER_FOLLOWS_REQUEST,
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
 * Returns an action object to signal that follows have been requested.
 *
 * @return {Object} 		Action object
 */
export function requestFollows() {
	return {
		type: READER_FOLLOWS_REQUEST,
	};
}
