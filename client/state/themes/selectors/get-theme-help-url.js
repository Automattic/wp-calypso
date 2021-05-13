/**
 * Internal dependencies
 */
import config from '@automattic/calypso-config';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { oldShowcaseUrl } from 'calypso/state/themes/utils';

import 'calypso/state/themes/init';

/**
 * Returns the URL for a given theme's support page.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {?number} siteId  Site ID to optionally use as context
 * @returns {?string}         Theme support page URL
 */
export function getThemeHelpUrl( state, themeId, siteId ) {
	if ( ! themeId ) {
		return null;
	}

	let baseUrl = oldShowcaseUrl + themeId;
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		baseUrl = `/theme/${ themeId }/support`;
	}

	return baseUrl + ( siteId ? `/${ getSiteSlug( state, siteId ) }` : '' );
}
