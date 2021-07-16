/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

const emptyList = [];

/**
 * Gets the list of trending themes.
 *
 * @param {object} state Global state tree
 *
 * @returns {Array} the list of trending themes
 */
export function getTrendingThemes( state ) {
	if ( ! state.themes.trendingThemes?.themes ) {
		return emptyList;
	}
	return Object.values( state.themes.trendingThemes?.themes );
}
