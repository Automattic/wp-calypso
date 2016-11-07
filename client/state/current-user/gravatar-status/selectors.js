/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Returns true if we're currently uploading a Gravatar
 * @param {Object} state - The state
 * @returns {Boolean} - If uploading a Gravatar
 */
export function isCurrentUserUploadingGravatar( state ) {
	return get( state, 'currentUser.gravatarStatus.isUploading', false );
}
