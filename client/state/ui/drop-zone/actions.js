/**
 * Internal dependencies
 */

import { DROPZONE_SHOW, DROPZONE_HIDE } from 'state/action-types';

/**
 * Fired when a DropZone gets shown
 *
 * @param {string} dropZoneName The Drop Zone being shown
 *
 * @returns {object} Redux action
 */
export function showDropZone( dropZoneName = null ) {
	return {
		type: DROPZONE_SHOW,
		dropZoneName,
	};
}

/**
 * Fired when a DropZone gets hidden
 *
 * @param {string} dropZoneName The Drop Zone being hidden
 *
 * @returns {object} Redux action
 */
export function hideDropZone( dropZoneName ) {
	return {
		type: DROPZONE_HIDE,
		dropZoneName,
	};
}
