/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

const emptyList = [];

/**
 * Gets the list of full site editing themes.
 *
 * @param {object} state Global state tree
 * @param {string} filter A filter string for a theme query
 *
 * @returns {Array} the list of full site editing themes
 */
export function getFullSiteEditingThemes( state, filter ) {
	return state.themes.fullSiteEditingThemes[ filter ]?.themes || emptyList;
}
