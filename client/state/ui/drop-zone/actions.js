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
 * @returns {Object} Redux action
 */
export function showDropZone() {
	return {
		type: DROPZONE_SHOW,
	};
}

/**
 * Fired when a DropZone gets hidden
 *
 * @returns {Object} Redux action
 */
export function hideDropZone() {
	return {
		type: DROPZONE_HIDE,
	};
}
