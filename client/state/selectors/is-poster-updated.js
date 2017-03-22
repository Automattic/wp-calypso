/**
 * Returns true if the poster has been updated.
 *
 * @param  {Object}  state Global state tree
 * @return {Boolean} true if the poster has been updated.
 *
 */
export default function isPosterUpdated( state ) {
	return state.ui.editor.videoEditor.isPosterUpdated;
}
