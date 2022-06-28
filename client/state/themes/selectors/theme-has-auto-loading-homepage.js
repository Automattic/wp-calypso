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
 * @param {number} siteId  An identifier for the site
 * @returns {boolean}      True if the theme has auto loading homepage. Otherwise, False.
 */
export function themeHasAutoLoadingHomepage( state, themeId, siteId ) {
	const atomic = isSiteAtomic( state, siteId );
	const atomicAutoLoading = includes(
		getThemeTaxonomySlugs( getTheme( state, siteId, themeId ), 'theme_feature' ),
		'auto-loading-homepage'
	);

	//If the Atomic site has the theme in its library, use that value
	if ( atomic && atomicAutoLoading ) {
		return atomicAutoLoading;
	}

	//Fall back to the full `wpcom` library
	return includes(
		getThemeTaxonomySlugs( getTheme( state, 'wpcom', themeId ), 'theme_feature' ),
		'auto-loading-homepage'
	);
}
