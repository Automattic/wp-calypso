/**
 * External dependencies
 */
import { has } from 'lodash';

/**
 * Returns true if we're currently uploading a Gravatar
 * @function
 * @param {Object} state - The state
 * @returns {Boolean} - If uploading a Gravatar
 */
export function isCurrentUserUploadingGravatar( state ) {
	return has( state, 'currentUser.gravatarStatus.isUploading' ) &&
		state.currentUser.gravatarStatus.isUploading;
}

/**
 * Returns the temp Gravatar if it exists and
 * the current user ID is passed in, otherwise false
 * @function
 * @param {Object} state - The state
 * @param {Number} userId - The ID of the user we're checking
 * @returns {String|Boolean} - The temp Gravatar string, or false
 */
export function getUserTempGravatar( state, userId ) {
	return state.currentUser.id === userId &&
		has( state, 'currentUser.gravatarStatus.tempImage.src' ) &&
		state.currentUser.gravatarStatus.tempImage.src;
}
