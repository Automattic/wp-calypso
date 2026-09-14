import versionCompare from 'calypso/lib/version-compare';
import { getSiteAdminUrl, getJetpackVersion, isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * Returns the appropriate URL for managing the Jetpack Search experience.
 * This function supports both Jetpack and WordPress.com sites.
 * @param  {Object}    state  Global state tree
 * @param  {?number}   siteId Site ID
 * @returns {?string}         URL for managing Jetpack Search.
 *                            Can be the Customizer or Jetpack Search settings.
 */
export default function getJetpackSearchCustomizeUrl( state, siteId ) {
	const adminUrl = getSiteAdminUrl( state, siteId );
	if ( ! adminUrl ) {
		return null;
	}

	if ( isJetpackSite( state, siteId ) ) {
		const jetpackVersion = getJetpackVersion( state, siteId );
		let url = adminUrl + 'customize.php?autofocus[section]=jetpack_search';
		if ( jetpackVersion && versionCompare( jetpackVersion, '10.1', '>=' ) ) {
			url = adminUrl + 'admin.php?page=jetpack-search&tab=settings';
		}
		return url;
	}

	// All WPCOM sites, both Simple and Atomic, support Jetpack Search settings.
	return adminUrl + 'admin.php?page=jetpack-search&tab=settings';
}
