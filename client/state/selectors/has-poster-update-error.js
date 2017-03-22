/**
 * Returns true if an error occurred while updating the poster.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean} true if the poster was not updated.
 *
 */
export default function hasPosterUpdateError( state ) {
	return state.ui.editor.videoEditor.hasPosterUpdateError;
}
