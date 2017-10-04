/**
 * Internal dependencies
 */
import {
	USER_REQUEST,
	USER_REQUEST_FAILURE,
	USER_REQUEST_SUCCESS,
	USERS_REQUEST,
} from 'state/action-types';
import wpcom from 'lib/wp';

/**
 * Triggers a network request to request the authenticated user information
 * @returns {Function}        Action thunk
 */
export function requestUser() {
	return ( dispatch ) => {
		dispatch( {
			type: USER_REQUEST,
		} );

		return wpcom.me().get( { meta: 'flags' } ).then( data => {
			dispatch( receiveUser( data ) );

			return Promise.resolve( data );
		} ).catch( ( error ) => {
			dispatch( {
				type: USER_REQUEST_FAILURE,
				error,
			} );

			return Promise.reject( error );
		} );
	};
}

/**
 * Returns an action object to be used in signalling that a user object has
 * been received.
 *
 * @param  {Object} user User received
 * @return {Object}      Action object
 */
export function receiveUser( user ) {
	return {
		type: USER_REQUEST_SUCCESS,
		user
	};
}

/**
 * Action creator function: USERS_REQUEST
 *
 * @param {String} siteId of the users
 * @param {Array}  ids of the users (array of integers)
 * @return {Object} action object
 */
export const requestUsers = ( siteId, ids ) => ( {
	type: USERS_REQUEST,
	ids,
	siteId,
} );
