import getRawSite from 'calypso/state/selectors/get-raw-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isJetpackSitePred, { IsJetpackSitePredOptions } from './is-jetpack-site-pred';
import type { AppState } from 'calypso/types';

/**
 * Returns true if site is a Jetpack site, false if the site is hosted on
 * WordPress.com, or null if the site is unknown.
 *
 * When options.considerStandaloneProducts is true (the default), sites with
 * Jetpack standalone plugins will also be considered Jetpack sites for the
 * purposes of this function.
 */
export default function isJetpackSite(
	state: AppState,
	siteId: number | undefined | null,
	options?: IsJetpackSitePredOptions
): boolean | null {
	if ( ! siteId ) {
		return null;
	}

	// if it's an atomic site, return false
	if ( isAtomicSite( state, siteId ) ) {
		return false;
	}

	const site = getRawSite( state, siteId );

	return isJetpackSitePred( options )( site );
}
