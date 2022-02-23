import { isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * Returns the Jetpack Search dashboard URL.
 *
 * @param  {object}    state        Global state tree
 * @param  {object}    siteID       Site ID
 * @returns {?string}  URL for Jetpack Search dashboard.
 *                     Falls back to the Jetpack dashboard for older versions.
 *                     Returns null for Simple sites.
 */

export default function getJetpackSearchDashboardUrl( state, siteID ) {
	if ( ! isJetpackSite( state, siteID ) ) {
		return null;
	}
	return '#';
}
