/**
 * Returns the poster URL of the video.
 *
 * @param  {Object}  state Global state tree
 * @return {String}  URL of the poster.
 */
export function getPosterUrl( state ) {
	return state.ui.editor.videoEditor.posterUrl;
}

/**
 * Returns the poster upload progress.
 *
 * @param  {Object}  state  Global state tree
 * @return {Number}  Poster upload progress percentage.
 */
export function getPosterUploadProgress( state ) {
	return state.ui.editor.videoEditor.uploadProgress;
}

/**
 * Returns true if the poster has been updated.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean} true if the poster has been updated.
 *
 */
export function isPosterUpdated( state ) {
	return state.ui.editor.videoEditor.isPosterUpdated;
}

/**
 * Returns true if an error occurred while updating the poster.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean} true if the poster was not updated.
 *
 */
export function hasPosterUpdateError( state ) {
	return state.ui.editor.videoEditor.hasPosterUpdateError;
}
