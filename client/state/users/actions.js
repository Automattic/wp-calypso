/**
 * Internal dependencies
 */
import { USER_RECEIVE, USERS_REQUEST } from 'state/action-types';

/**
 * Returns an action object to be used in signalling that a user object has
 * been received.
 *
 * @param  {Object} user User received
 * @return {Object}      Action object
 */
export function receiveUser( user ) {
	return {
		type: USER_RECEIVE,
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
