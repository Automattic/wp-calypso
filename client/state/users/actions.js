/** @format */

/**
 * Internal dependencies
 */

import { USER_RECEIVE, USERS_RECEIVE, USERS_REQUEST } from 'state/action-types';

import 'state/data-layer/wpcom/sites/users';

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
		user,
	};
}

/**
 * Action creator for receiving an array of users from REST response
 * @param {Array} users Users received
 * @return {Object} Action object
 */
export function receiveUsers( users ) {
	return {
		type: USERS_RECEIVE,
		users,
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
