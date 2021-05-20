/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

const emptyList = [];

/**
 * Gets the list of recommended themes.
 *
 * @param {object} state Global state tree
 * @param {string} filter A filter string for a theme query
 *
 * @returns {Array} the list of recommended themes
 */
export function getRecommendedThemes( state, filter ) {
	return state.themes.recommendedThemes[ filter ]?.themes || emptyList;
}
