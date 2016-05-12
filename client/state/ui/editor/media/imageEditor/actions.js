/**
 * Internal dependencies
 */
import {
	IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
	IMAGE_EDITOR_FLIP,
	IMAGE_EDITOR_SET_FILE_INFO,
	IMAGE_EDITOR_STATE_RESET
} from 'state/action-types';

export function resetImageEditorState() {
	return {
		type: IMAGE_EDITOR_STATE_RESET
	};
}

export function imageEditorRotateCounterclockwise() {
	return {
		type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
	};
}

export function imageEditorFlip() {
	return {
		type: IMAGE_EDITOR_FLIP
	};
}

export function setImageEditorFileInfo( src, fileName, mimeType ) {
	return {
		type: IMAGE_EDITOR_SET_FILE_INFO,
		src,
		fileName,
		mimeType
	};
}
