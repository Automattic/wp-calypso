import { includes } from 'lodash';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { getThemeTaxonomySlugs } from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

/**
 * Checks if a theme has auto loading homepage feature.
 *
 * @param {object} state   Global state tree
 * @param {string} themeId An identifier for the theme
 * @returns {boolean} True if the theme has auto loading homepage. Otherwise, False.
 */
export function themeHasAutoLoadingHomepage( state, themeId ) {
	return includes(
		getThemeTaxonomySlugs( getTheme( state, 'wpcom', themeId ), 'theme_feature' ),
		'auto-loading-homepage'
	);
}
