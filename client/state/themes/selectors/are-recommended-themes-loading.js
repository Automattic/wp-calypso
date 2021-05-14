/**
 * External dependencies
 */
import { camelCase } from 'lodash';

/**
 * Internal dependencies
 */
import { getRecommendedThemesFilter } from 'calypso/state/themes/utils';
import 'calypso/state/themes/init';

/**
 * Returns whether the recommended themes list is loading.
 *
 * @param {object} state Global state tree
 * @param {boolean} blockThemes Whether or not the recommended themes are block themes
 *
 * @returns {boolean} whether the recommended themes list is loading
 */
export function areRecommendedThemesLoading( state, blockThemes = false ) {
	const filter = getRecommendedThemesFilter( blockThemes );
	const key = camelCase( filter );
	return state.themes.recommendedThemes[ key ]?.isLoading || false;
}
