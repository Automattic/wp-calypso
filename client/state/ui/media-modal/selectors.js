/**
 * Returns the current media modal view.
 *
 *
 *
 * @format
 * @see ./constants.js (MediaView)
 * @param {Object}    state Global state tree
 * @return {MediaView}       Current media view
 */

export function getMediaModalView( state ) {
	return state.ui.mediaModal.view;
}
