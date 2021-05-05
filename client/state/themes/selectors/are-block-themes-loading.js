/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

/**
 * Returns whether the block themes list is loading.
 *
 * @param {object} state Global state tree
 *
 * @returns {boolean} whether the recommended themes list is loading
 */
export function areBlockThemesLoading( state ) {
	return state.themes.blockThemes.isLoading;
}
