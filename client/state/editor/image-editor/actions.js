/**
 * Internal dependencies
 */
import {
	IMAGE_EDITOR_CROP,
	IMAGE_EDITOR_COMPUTED_CROP,
	IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
	IMAGE_EDITOR_FLIP,
	IMAGE_EDITOR_SET_ASPECT_RATIO,
	IMAGE_EDITOR_SET_DEFAULT_ASPECT_RATIO,
	IMAGE_EDITOR_SET_CROP_BOUNDS,
	IMAGE_EDITOR_SET_FILE_INFO,
	IMAGE_EDITOR_STATE_RESET,
	IMAGE_EDITOR_STATE_RESET_ALL,
	IMAGE_EDITOR_IMAGE_HAS_LOADED,
} from 'calypso/state/action-types';

import 'calypso/state/editor/init';

// Doesn't reset image file info (src, fileName, etc).
// additionalData can contain arbitrarily needed data.
export function resetImageEditorState( additionalData = {} ) {
	return {
		type: IMAGE_EDITOR_STATE_RESET,
		additionalData,
	};
}

// Resets image file info as well (src, fileName, etc).
// additionalData can contain arbitrarily needed data.
export function resetAllImageEditorState( additionalData = {} ) {
	return {
		type: IMAGE_EDITOR_STATE_RESET_ALL,
		additionalData,
	};
}

export function imageEditorRotateCounterclockwise() {
	return {
		type: IMAGE_EDITOR_ROTATE_COUNTERCLOCKWISE,
	};
}

export function imageEditorFlip() {
	return {
		type: IMAGE_EDITOR_FLIP,
	};
}

export function setImageEditorAspectRatio( ratio ) {
	return {
		type: IMAGE_EDITOR_SET_ASPECT_RATIO,
		ratio,
	};
}

export function setImageEditorDefaultAspectRatio( ratio ) {
	return {
		type: IMAGE_EDITOR_SET_DEFAULT_ASPECT_RATIO,
		ratio,
	};
}

export function setImageEditorFileInfo( src, fileName, mimeType, title ) {
	return {
		type: IMAGE_EDITOR_SET_FILE_INFO,
		src,
		fileName,
		mimeType,
		title,
	};
}

export function setImageEditorCropBounds( topBound, leftBound, bottomBound, rightBound ) {
	return {
		type: IMAGE_EDITOR_SET_CROP_BOUNDS,
		topBound,
		leftBound,
		bottomBound,
		rightBound,
	};
}

export function imageEditorComputedCrop( topRatio, leftRatio, widthRatio, heightRatio ) {
	return {
		type: IMAGE_EDITOR_COMPUTED_CROP,
		topRatio,
		leftRatio,
		widthRatio,
		heightRatio,
	};
}

export function imageEditorCrop( topRatio, leftRatio, widthRatio, heightRatio ) {
	return {
		type: IMAGE_EDITOR_CROP,
		topRatio,
		leftRatio,
		widthRatio,
		heightRatio,
	};
}

export function setImageEditorImageHasLoaded( width, height ) {
	return {
		type: IMAGE_EDITOR_IMAGE_HAS_LOADED,
		width,
		height,
	};
}
