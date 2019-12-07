/** @format */

/**
 * Internal dependencies
 */

import { CURRENT_USER_RECEIVE } from 'state/action-types';

/**
 * Returns an action object that sets the current user object on the store
 *
 * @param  {Object} user user object
 * @return {Object}        Action object
 */
export function setCurrentUser( user ) {
	return {
		type: CURRENT_USER_RECEIVE,
		user,
	};
}
