import 'calypso/state/themes/init';

/**
 * Returns whether the recommended themes list is loading.
 *
 * @param {Object} state Global state tree
 * @param {string} filter A filter string for a theme query
 * @returns {boolean} whether the recommended themes list is loading
 */
export function areRecommendedThemesLoading( state, filter ) {
	return state.themes.recommendedThemes[ filter ]?.isLoading || false;
}
