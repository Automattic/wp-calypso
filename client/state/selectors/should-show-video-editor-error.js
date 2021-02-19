/**
 * Internal dependencies
 */
import 'calypso/state/posts/init';

/**
 * Returns true if an error should be shown in the video editor.
 *
 *
 * @param {object}  state Global state tree
 * @returns {boolean} true if an error should be shown.
 */

export default function shouldShowVideoEditorError( state ) {
	return state.editor.videoEditor.showError;
}
