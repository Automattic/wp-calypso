/**
 * Internal dependencies
 */
import {
	DROPZONE_SHOW,
	DROPZONE_HIDE
} from 'state/action-types';

export function showDropZone() {
	return {
		type: DROPZONE_SHOW,
	};
}

export function hideDropZone() {
	return {
		type: DROPZONE_HIDE,
	};
}
