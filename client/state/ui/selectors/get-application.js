/**
 * Returns the current application.
 *
 * @param  {object}  state Global state tree
 * @returns {object}       Current application
 */
export default function getApplication( state ) {
	return state.ui.application || false;
}
