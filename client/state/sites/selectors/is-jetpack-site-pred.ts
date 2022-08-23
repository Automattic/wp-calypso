import type { SiteDetails } from '@automattic/data-stores';

export type IsJetpackSitePredOptions = {
	considerStandaloneProducts?: boolean;
};

const DEFAULT_OPTIONS: IsJetpackSitePredOptions = {
	considerStandaloneProducts: true,
};

/**
 * A function that returns a predicate which when passed a site
 * returns true if site is a Jetpack site, false if the site is hosted on
 * WordPress.com, or null if the site is unknown.
 *
 * When options.considerStandaloneProducts is true (the default), sites with
 * Jetpack standalone plugins will also be considered Jetpack sites for the
 * purposes of this function.
 *
 * CAUTION: It does not consider whether the site is an Atomic site.
 */
export default function isJetpackSitePred( options?: IsJetpackSitePredOptions ) {
	return function isJetpackSite( site: SiteDetails | null ): boolean | null {
		if ( ! site ) {
			return null;
		}

		// Sites with full Jetpack plugin have a boolean `jetpack` property.
		if ( site.jetpack ) {
			return true;
		}

		// Merge default options with options.
		const mergedOptions = options ? { ...DEFAULT_OPTIONS, ...options } : DEFAULT_OPTIONS;

		// If we should not consider standalone products
		if ( ! mergedOptions.considerStandaloneProducts ) {
			return false;
		}

		return Boolean( site.options?.jetpack_connection_active_plugins?.length );
	};
}
