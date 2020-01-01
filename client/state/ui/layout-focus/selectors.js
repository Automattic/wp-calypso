/**
 * Returns the current layout focus area
 *
 *
 * @param {object}  state Global state tree
 * @return {?string}  The current layout focus area
 */

export function getCurrentLayoutFocus( state ) {
	return state.ui.layoutFocus.current;
}
