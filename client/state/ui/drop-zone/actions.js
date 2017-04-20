/**
 * Internal dependencies
 */
import {
	DROPZONE_SHOW,
	DROPZONE_HIDE
} from 'state/action-types';

/**
 * Fired when a DropZone gets shown
 *
 * @param {String} dropZoneName The Drop Zone being shown
 *
 * @returns {Object} Redux action
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
 * @param {String} dropZoneName The Drop Zone being hidden
 *
 * @returns {Object} Redux action
 */
export function hideDropZone( dropZoneName ) {
	return {
		type: DROPZONE_HIDE,
		dropZoneName,
	};
}
