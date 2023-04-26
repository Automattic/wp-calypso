import 'calypso/state/posts/init';

/**
 * Returns the poster upload progress.
 *
 *
 * @param {Object}  state  Global state tree
 * @returns {number}  Poster upload progress percentage.
 */
export default function getPosterUploadProgress( state ) {
	return state.editor.videoEditor.uploadProgress;
}
