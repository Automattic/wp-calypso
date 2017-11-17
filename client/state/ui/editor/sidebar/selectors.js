/** @format */
/**
 * Returns a string representing the current target of the nested sidebar
 *
 * @param {Object}  state Global state tree
 * @return {String}  target view of the nested sidebar
 */
export function getNestedSidebarTarget( state ) {
	return state.ui.editor.sidebar.nestedSidebarTarget;
}
