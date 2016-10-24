/**
 * External dependencies
 */
import debugModule from 'debug';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_UNFOLLOW
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
			url
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
			url
		} );
	};
}
