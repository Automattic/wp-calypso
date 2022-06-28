import { includes } from 'lodash';
import isSiteAtomic from 'calypso/state/selectors/is-site-wpcom-atomic';
import { getTheme } from 'calypso/state/themes/selectors/get-theme';
import { getThemeTaxonomySlugs } from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

/**
 * Checks if a theme has auto loading homepage feature.
 *
 * @param {object} state   Global state tree
 * @param {string} themeId An identifier for the theme
 * @param {number} siteId An identifier for the site
 * @returns {boolean} True if the theme has auto loading homepage. Otherwise, False.
 */
export function themeHasAutoLoadingHomepage( state, themeId, siteId ) {
	if ( siteId && ! isSiteAtomic( state, siteId ) ) {
		siteId = 'wpcom';
	}

	return includes(
		getThemeTaxonomySlugs( getTheme( state, siteId, themeId ), 'theme_feature' ),
		'auto-loading-homepage'
	);
}
