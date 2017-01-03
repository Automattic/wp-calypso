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
	IMAGE_EDITOR_STATE_RESET,
	IMAGE_EDITOR_STATE_RESET_ALL,
	IMAGE_EDITOR_IMAGE_HAS_LOADED
} from 'state/action-types';

export function resetImageEditorState( defaultAspectRatio ) {
	return {
		type: IMAGE_EDITOR_STATE_RESET,
		defaultAspectRatio
	};
}

export function resetAllImageEditorState( defaultAspectRatio ) {
	return {
		type: IMAGE_EDITOR_STATE_RESET_ALL,
		defaultAspectRatio
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

export function setImageEditorAspectRatio( ratio, isImageEditorInitialized = true ) {
	return {
		type: IMAGE_EDITOR_SET_ASPECT_RATIO,
		ratio,
		isImageEditorInitialized
	};
}

export function setImageEditorFileInfo( src, fileName, mimeType, title ) {
	return {
		type: IMAGE_EDITOR_SET_FILE_INFO,
		src,
		fileName,
		mimeType,
		title
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

export function setImageEditorImageHasLoaded() {
	return {
		type: IMAGE_EDITOR_IMAGE_HAS_LOADED
	};
}
