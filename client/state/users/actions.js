/** @format */

/**
 * Internal dependencies
 */

import { USER_RECEIVE } from 'state/action-types';

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
