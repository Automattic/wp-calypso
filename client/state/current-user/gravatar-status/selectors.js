/**
 * External dependencies
 */

import { get } from 'lodash';

/**
 * Returns true if we're currently uploading a Gravatar
 * @param {object} state - The state
 * @returns {boolean} - If uploading a Gravatar
 */
export function isCurrentUserUploadingGravatar( state ) {
	return get( state, 'currentUser.gravatarStatus.isUploading', false );
}

/**
 * Returns the temp Gravatar if it exists and
 * the current user ID is passed in, otherwise false
 * @param {object} state - The state
 * @param {number} userId - The ID of the user we're checking
 * @returns {string|boolean} - The temp Gravatar string, or false
 */
export function getUserTempGravatar( state, userId ) {
	return (
		state.currentUser.id === userId &&
		get( state, 'currentUser.gravatarStatus.tempImage.src', false )
	);
}
