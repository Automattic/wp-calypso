/**
 * Internal dependencies
 */
import 'calypso/state/themes/init';

const emptyList = [];

/**
 * Gets the list of block themes.
 *
 * @param {object} state Global state tree
 *
 * @returns {Array} the list of block themes
 */
export function getBlockThemes( state ) {
	return state.themes.blockThemes.themes || emptyList;
}
