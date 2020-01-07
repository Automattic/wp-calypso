/**
 * Returns whether a section is loading.
 *
 * @param  {object}  state Global state tree
 * @return {boolean}       Whether the section is loading
 */
export default function isSectionLoading( state ) {
	return state.ui.isLoading;
}
