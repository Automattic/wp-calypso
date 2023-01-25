import 'calypso/state/themes/init';

/**
 * Returns whether the trending themes list is loading.
 *
 * @param {object} state Global state tree
 * @returns {boolean} whether the trending themes list is loading
 */
export function areTrendingThemesLoading( state ) {
	return state.themes.trendingThemes?.isLoading || false;
}
