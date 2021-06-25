/**
 * Internal dependencies
 */
import 'calypso/state/editor/init';

/**
 * Returns an object representing the image editor transform
 *
 *
 * @param {object}  state Global state tree
 * @returns {object}  image editor transform { degrees, scaleX, scaleY }
 */
export function getImageEditorTransform( state ) {
	return state.editor.imageEditor.transform;
}

/**
 * Returns an object containing the image data loaded in the editor
 *
 * @param  {object}  state Global state tree
 * @returns {object}  image data { src, fileName }
 *
 */
export function getImageEditorFileInfo( state ) {
	return state.editor.imageEditor.fileInfo;
}

/**
 * Returns true if there were any changes made to the editor
 *
 * @param  {object}  state Global state tree
 * @returns {boolean} true if editor has changes
 *
 */
export function imageEditorHasChanges( state ) {
	return state.editor.imageEditor.hasChanges;
}

/**
 * Returns true if image has been loaded.
 *
 * @param  {object}  state Global state tree
 * @returns {boolean} true if image has been loaded
 *
 */
export function isImageEditorImageLoaded( state ) {
	return ! state.editor.imageEditor.imageIsLoading;
}

/**
 * Returns the bounds of the canvas crop tool
 *
 * @param  {object} state Global state tree
 * @returns {object} topBound, leftBound, bottomBound and rightBound of the canvas
 *
 */
export function getImageEditorCropBounds( state ) {
	return state.editor.imageEditor.cropBounds;
}

/**
 * Returns the crop data for the image editor
 *
 * @param  {object} state Global state tree
 * @returns {object} topRatio, leftRatio, widthRatio and heightRatio of the crop
 *
 */
export function getImageEditorCrop( state ) {
	return state.editor.imageEditor.crop;
}

/**
 * Returns the crop data for the image editor
 *
 * @param  {object} state Global state tree
 * @returns {object} one of the AspectRatios as defined in state/editor/image-editor/constants
 *
 */
export function getImageEditorAspectRatio( state ) {
	return state.editor.imageEditor.aspectRatio;
}
