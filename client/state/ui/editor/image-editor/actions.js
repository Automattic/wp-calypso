/**
 * Internal dependencies
 */
import {
	IMAGE_EDITOR_CROP,
	IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
	IMAGE_EDITOR_FLIP,
	IMAGE_EDITOR_SET_ASPECT_RATIO,
	IMAGE_EDITOR_SET_CROP_BOUNDS,
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

export function setImageEditorAspectRatio( ratio ) {
	return {
		type: IMAGE_EDITOR_SET_ASPECT_RATIO,
		ratio
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

export function setImageEditorCropBounds( topBound, leftBound, bottomBound, rightBound ) {
	return {
		type: IMAGE_EDITOR_SET_CROP_BOUNDS,
		topBound,
		leftBound,
		bottomBound,
		rightBound
	};
}

export function imageEditorCrop( topRatio, leftRatio, widthRatio, heightRatio ) {
	return {
		type: IMAGE_EDITOR_CROP,
		topRatio,
		leftRatio,
		widthRatio,
		heightRatio
	};
}
