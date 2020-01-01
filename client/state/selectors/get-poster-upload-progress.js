/**
 * Returns the poster upload progress.
 *
 *
 * @param {object}  state  Global state tree
 * @return {number}  Poster upload progress percentage.
 */

export default function getPosterUploadProgress( state ) {
	return state.ui.editor.videoEditor.uploadProgress;
}
