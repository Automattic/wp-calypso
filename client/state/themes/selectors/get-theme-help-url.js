import { getSiteSlug } from 'calypso/state/sites/selectors';

import 'calypso/state/themes/init';

/**
 * Returns the URL for a given theme's support page.
 *
 * @param  {Object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {?number} siteId  Site ID to optionally use as context
 * @returns {?string}         Theme support page URL
 */
export function getThemeHelpUrl( state, themeId, siteId ) {
	if ( ! themeId ) {
		return null;
	}

	const sitePart = siteId ? `/${ getSiteSlug( state, siteId ) }` : '';
	return `/theme/${ themeId }/support${ sitePart }`;
}
