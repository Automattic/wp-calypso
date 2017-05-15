/**
 * Returns true if the video editor modal should be closed.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean} true if the modal should be closed.
 *
 */
export default function shouldCloseVideoEditorModal( state ) {
	return state.ui.editor.videoEditor.closeModal;
}
