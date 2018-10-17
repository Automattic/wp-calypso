/** @format */

/**
 * Internal dependencies
 */

import { CURRENT_USER_FLAGS_RECEIVE, CURRENT_USER_RECEIVE } from 'state/action-types';

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
