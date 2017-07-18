/**
 * Returns an object representing the image editor transform
 *
 * @param  {Object}  state Global state tree
 * @return {Object}  image editor transform { degrees, scaleX, scaleY }
 *
 */
export function getImageEditorTransform( state ) {
	return state.ui.editor.imageEditor.transform;
}

/**
 * Returns an object containing the image data loaded in the editor
 *
 * @param  {Object}  state Global state tree
 * @return {Object}  image data { src, fileName }
 *
 */
export function getImageEditorFileInfo( state ) {
	return state.ui.editor.imageEditor.fileInfo;
}

/**
 * Returns true if there were any changes made to the editor
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean} true if editor has changes
 *
 */
export function imageEditorHasChanges( state ) {
	return state.ui.editor.imageEditor.hasChanges;
}

/**
 * Returns true if image has been loaded.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean} true if image has been loaded
 *
 */
export function isImageEditorImageLoaded( state ) {
	return ! state.ui.editor.imageEditor.imageIsLoading;
}

/**
 * Returns the bounds of the canvas crop tool
 *
 * @param  {Object} state Global state tree
 * @return {Object} topBound, leftBound, bottomBound and rightBound of the canvas
 *
 */
export function getImageEditorCropBounds( state ) {
	return state.ui.editor.imageEditor.cropBounds;
}

/**
 * Returns the crop data for the image editor
 *
 * @param  {Object} state Global state tree
 * @return {Object} topRatio, leftRatio, widthRatio and heightRatio of the crop
 *
 */
export function getImageEditorCrop( state ) {
	return state.ui.editor.imageEditor.crop;
}

/**
 * Returns the crop data for the image editor
 *
 * @param  {Object} state Global state tree
 * @return {Object} one of the AspectRatios as defined in state/ui/editor/image-editor/constants
 *
 */
export function getImageEditorAspectRatio( state ) {
	return state.ui.editor.imageEditor.aspectRatio;
}

/**
 * Returns whether the image meets the minimum dimensions for full editor capabilities
 *
 * @param  {Object} state Global state tree
 * @return {Boolean} whether the image meets the minimum dimensions or not
 *
 */
export function getImageMeetsMinimumDimensions( state ) {
	return state.ui.editor.imageEditor.meetsMinimumDimensions;
}

