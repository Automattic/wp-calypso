import { getSiteSlug } from 'calypso/state/sites/selectors';
import { isThemePremium } from 'calypso/state/themes/selectors/is-theme-premium';

import 'calypso/state/themes/init';

/**
 * Returns the URL for a given theme's setup instructions
 *
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {?number} siteId  Site ID to optionally use as context
 * @returns {?string}         Theme setup instructions URL
 */
export function getThemeSupportUrl( state, themeId, siteId ) {
	if ( ! themeId || ! isThemePremium( state, themeId ) ) {
		return null;
	}

	const sitePart = siteId ? `/${ getSiteSlug( state, siteId ) }` : '';
	return `/theme/${ themeId }/setup${ sitePart }`;
}
