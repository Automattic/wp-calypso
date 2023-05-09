import 'calypso/state/themes/init';

/**
 * Returns the list of available theme filters
 *
 *
 * @param {Object}  state Global state tree
 * @returns {Object}        A nested list of theme filters, keyed by filter slug
 */
export function getThemeFilters( state ) {
	return state.themes.themeFilters;
}
