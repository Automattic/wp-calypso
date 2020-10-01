/**
 * Returns the current sidebar collapsed state
 *
 *
 * @param {object}  state Global state tree
 * @returns {boolean}  The current sidebar collapsed state
 */

export function getSidebarIsCollapsed( state ) {
	return state.ui.sidebarIsCollapsed;
}
