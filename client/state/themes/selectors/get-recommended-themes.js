/**
 * External dependencies
 */
import { camelCase } from 'lodash';

/**
 * Internal dependencies
 */
import { getRecommendedThemesFilter } from 'calypso/state/themes/utils';
import 'calypso/state/themes/init';

const emptyList = [];

/**
 * Gets the list of recommended themes.
 *
 * @param {object} state Global state tree
 * @param {boolean} blockThemes Whether or not the recommended themes are block themes
 *
 * @returns {Array} the list of recommended themes
 */
export function getRecommendedThemes( state, blockThemes = false ) {
	const filter = getRecommendedThemesFilter( blockThemes );
	const key = camelCase( filter );
	return state.themes.recommendedThemes[ key ]?.themes || emptyList;
}
