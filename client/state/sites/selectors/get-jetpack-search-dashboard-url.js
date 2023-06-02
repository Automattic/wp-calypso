import versionCompare from 'calypso/lib/version-compare';
import { getJetpackVersion, getSiteAdminUrl, isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * Returns the Jetpack Search dashboard URL.
 *
 * @param  {Object}    state        Global state tree
 * @param  {Object}    siteID       Site ID
 * @returns {?string}  URL for Jetpack Search dashboard.
 *                     Falls back to the Jetpack dashboard for older versions.
 *                     Returns null for Simple sites.
 */

export default function getJetpackSearchDashboardUrl( state, siteID ) {
	if ( ! isJetpackSite( state, siteID ) ) {
		return null;
	}
	const adminUrl = getSiteAdminUrl( state, siteID );
	if ( ! adminUrl ) {
		return null;
	}
	const jetpackVersion = getJetpackVersion( state, siteID );
	if ( jetpackVersion && versionCompare( jetpackVersion, '10.1', '>=' ) ) {
		return adminUrl + 'admin.php?page=jetpack-search';
	}
	return adminUrl + 'admin.php?page=jetpack#/performance';
}
