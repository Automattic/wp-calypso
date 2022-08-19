import getRawSite from 'calypso/state/selectors/get-raw-site';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import type { AppState } from 'calypso/types';

const defaultOptions = {
	considerStandaloneProducts: true,
};

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
	options?: { considerStandaloneProducts?: boolean }
): boolean | null {
	if ( ! siteId ) {
		return null;
	}

	// Merge default options with options.
	options = options ? { ...defaultOptions, ...options } : defaultOptions;

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
	if ( ! options.considerStandaloneProducts ) {
		return false;
	}

	return Boolean( site.options?.jetpack_connection_active_plugins?.length );
}
