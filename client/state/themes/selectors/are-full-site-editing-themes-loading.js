/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

/**
 * Returns whether the full site editing themes list is loading.
 *
 * @param {object} state Global state tree
 * @param {string} filter A filter string for a theme query
 *
 * @returns {boolean} whether the full site editing themes list is loading
 */
export function areFullSiteEditingThemesLoading( state, filter ) {
	return state.themes.fullSiteEditingThemes[ filter ]?.isLoading || false;
}
