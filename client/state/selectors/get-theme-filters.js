/**
 * Returns the list of available theme filters
 *
 * @param  {Object}  state Global state tree
 * @return {Object}        A nested list of theme filters, keyed by filter slug
 */

export default function getThemeFilters( state ) {
	return state.themes.themeFilters;
}
