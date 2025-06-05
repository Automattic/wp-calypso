import { getCurrentUserId } from 'calypso/state/current-user/selectors';

import 'calypso/state/gravatar-status/init';

/**
 * Returns true if we're currently uploading a Gravatar
 * @param {Object} state - The state
 * @returns {boolean} - If uploading a Gravatar
 */
export function isCurrentUserUploadingGravatar( state ) {
	return state.gravatarStatus.isUploading;
}

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

export const hasGravatar = ( state ) => {
	return !! state.gravatarStatus?.gravatarDetails?.has_gravatar;
};
