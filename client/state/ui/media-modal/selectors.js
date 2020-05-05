/**
 * Returns the current media modal view.
 *
 *
 *
 * @see ./constants.js (MediaView)
 * @param {object}    state Global state tree
 * @returns {MediaView}       Current media view
 */

export function getMediaModalView( state ) {
	return state.ui.mediaModal.view;
}
