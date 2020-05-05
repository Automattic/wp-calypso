/**
 * Returns true if an error should be shown in the video editor.
 *
 *
 * @param {object}  state Global state tree
 * @returns {boolean} true if an error should be shown.
 */

export default function shouldShowVideoEditorError( state ) {
	return state.ui.editor.videoEditor.showError;
}
