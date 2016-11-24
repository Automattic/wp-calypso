/** @ssr-ready **/

/**
 * Returns the current layout focus area
 *
 * @param  {Object}  state Global state tree
 * @return {?String}  The current layout focus area
 */
export function getCurrentLayoutFocus( state ) {
	return state.ui.layoutFocus.current;
}
