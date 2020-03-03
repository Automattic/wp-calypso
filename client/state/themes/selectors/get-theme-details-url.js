/**
 * Internal dependencies
 */
import config from 'config';
import {
	getSiteSlug,
	getSiteOption,
	isJetpackSite,
	canJetpackSiteManage,
	hasJetpackSiteJetpackThemesExtendedFeatures,
} from 'state/sites/selectors';
import { oldShowcaseUrl } from 'state/themes/utils';

import 'state/themes/init';

/**
 * Returns the URL for a given theme's details sheet.
 *
 * @param  {object}  state   Global state tree
 * @param  {string}  themeId Theme ID
 * @param  {?number} siteId  Site ID to optionally use as context
 * @returns {?string}         Theme details sheet URL
 */
export function getThemeDetailsUrl( state, themeId, siteId ) {
	if ( ! themeId ) {
		return null;
	}

	if (
		isJetpackSite( state, siteId ) &&
		! (
			config.isEnabled( 'manage/themes/details/jetpack' ) &&
			canJetpackSiteManage( state, siteId ) &&
			hasJetpackSiteJetpackThemesExtendedFeatures( state, siteId )
		)
	) {
		return getSiteOption( state, siteId, 'admin_url' ) + 'themes.php?theme=' + themeId;
	}

	let baseUrl = oldShowcaseUrl + themeId;
	if ( config.isEnabled( 'manage/themes/details' ) ) {
		baseUrl = `/theme/${ themeId }`;
	}

	return baseUrl + ( siteId ? `/${ getSiteSlug( state, siteId ) }` : '' );
}
