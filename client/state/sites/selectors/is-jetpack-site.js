import getRawSite from 'calypso/state/selectors/get-raw-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { AppState } from 'calypso/types';

/**
 * Returns true if site is a Jetpack site, false if the site is hosted on
 * WordPress.com, or null if the site is unknown.
 *
 * @param  {AppState} state  Global state tree
 * @param  {number}   siteId Site ID
 * @param  {boolean}  considerStandaloneProducts Whether to consider sites with Jetpack standalone plugins installed
 * @returns {boolean | null} Whether site is a Jetpack site
 */
export default function isJetpackSite( state, siteId, considerStandaloneProducts = true ) {
	const site = getRawSite( state, siteId );
	if ( ! site ) {
		return null;
	}

	// Sites with full Jetpack plugin have a boolean `jetpack` property.
	if ( site.jetpack ) {
		return true;
	}

	// if it's an atomic site, return false
	if ( isAtomicSite( state, siteId ) ) {
		return false;
	}

	// If we should not consider standalone products
	if ( ! considerStandaloneProducts ) {
		return false;
	}

	return Boolean( site.options?.jetpack_connection_active_plugins?.length );
}
