/** @format */

/**
 * Internal dependencies
 */

import { CURRENT_USER_RECEIVE, CURRENT_USER_FLAGS_RECEIVE } from 'state/action-types';

/**
 * Returns an action object to be used in signalling that the current user ID
 * has been set.
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

export function setCurrentUserFlags( flags ) {
	return {
		type: CURRENT_USER_FLAGS_RECEIVE,
		flags,
	};
}
