/**
 * Returns the poster URL of the video.
 *
 * @param  {Object}  state Global state tree
 * @return {String}  URL of the poster.
 */
export function getVideoEditorPoster( state ) {
	return state.ui.editor.videoEditor.poster;
}

/**
 * Returns true if the poster is updating.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean} true if the poster is updating.
 *
 */
export function isVideoEditorPosterUpdating( state ) {
	return state.ui.editor.videoEditor.posterIsUpdating;
}

/**
 * Returns true if the poster has been updated.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean} true if the poster has been updated.
 *
 */
export function isVideoEditorPosterUpdated( state ) {
	return state.ui.editor.videoEditor.posterIsUpdated;
}

/**
 * Returns true if an error occurred while updating the poster.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean} true if the poster was not updated.
 *
 */
export function videoEditorHasPosterUpdateError( state ) {
	return state.ui.editor.videoEditor.hasPosterUpdateError;
}
