/**
 * Returns the current page state value for the given key.
 *
 * @param  {Object} state Global state tree
 * @param  {String} key   Page state key
 * @return {*}            Page state value
 */
export function getPageState( state, key ) {
	return state.ui.page[ key ];
}
