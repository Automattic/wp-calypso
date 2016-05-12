/**
 * Returns an object representing the image editor transform
 *
 * @param  {Object}  state Global state tree
 * @return {Object}  image editor transform { degrees, scaleX, scaleY }
 *
 */
export function getImageEditorTransform( state ) {
	return state.ui.editor.media.imageEditor.transform;
}

/**
 * Returns an object containing the image data loaded in the editor
 *
 * @param  {Object}  state Global state tree
 * @return {Object}  image data { src, fileName }
 *
 */
export function getImageEditorFileInfo( state ) {
	return state.ui.editor.media.imageEditor.fileInfo;
}

/**
 * Returns true if there were any changes made to the editor
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean} true if editor has changes
 *
 */
export function imageEditorHasChanges( state ) {
	return state.ui.editor.media.imageEditor.hasChanges;
}
