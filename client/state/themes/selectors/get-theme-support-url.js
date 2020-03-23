/**
 * Internal dependencies
 */
import config from 'config';
import { getSiteSlug } from 'state/sites/selectors';
import { isThemePremium } from 'state/themes/selectors/is-theme-premium';
import { oldShowcaseUrl } from 'state/themes/utils';

import 'state/themes/init';

/**
 * Returns the URL for a given theme's setup instructions
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {?number} siteId  Site ID to optionally use as context
 * @returns {?string}         Theme setup instructions URL
 */
export function getThemeSupportUrl( state, themeId, siteId ) {
	if ( ! themeId || ! isThemePremium( state, themeId ) ) {
		return null;
	}

	const sitePart = siteId ? `/${ getSiteSlug( state, siteId ) }` : '';

	if ( config.isEnabled( 'manage/themes/details' ) ) {
		return `/theme/${ themeId }/setup${ sitePart }`;
	}

	return `${ oldShowcaseUrl }${ sitePart }${ themeId }/support`;
}
