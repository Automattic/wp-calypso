import { getCurrentUserId } from 'calypso/state/current-user/selectors';

import 'calypso/state/gravatar-status/init';

/**
 * Returns the temp Gravatar if it exists and
 * the current user ID is passed in, otherwise false
 * @param {Object} state - The state
 * @param {number} userId - The ID of the user we're checking
 * @returns {string|boolean} - The temp Gravatar string, or false
 */
export function getUserTempGravatar( state, userId ) {
	return getCurrentUserId( state ) === userId && ( state.gravatarStatus.tempImage ?? false );
}
