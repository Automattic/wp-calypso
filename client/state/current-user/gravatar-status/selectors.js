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
