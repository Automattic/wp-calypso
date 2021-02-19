/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

const emptyList = [];

/**
 * Gets the list of recommended themes.
 *
 * @param {object} state Global state tree
 *
 * @returns {Array} the list of recommended themes
 */
export function getRecommendedThemes( state ) {
	return state.themes.recommendedThemes.themes || emptyList;
}
