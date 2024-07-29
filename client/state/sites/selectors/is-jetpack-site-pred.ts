import type { SiteDetails } from '@automattic/data-stores';

export type IsJetpackSitePredOptions = {
	/**
	 * When true, the sites with Jetpack standalone plugins will also be considered Jetpack sites
	 */
	considerStandaloneProducts?: boolean;
	/**
	 * When true, the Atomic site will also be considered as Jetpack site
	 */
	treatAtomicAsJetpackSite?: boolean;
};

const DEFAULT_OPTIONS: IsJetpackSitePredOptions = {
	considerStandaloneProducts: true,
	treatAtomicAsJetpackSite: true,
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
 * When options.treatAtomicAsJetpackSite is true (the default), Atomic sites with
 * Jetpack will also be considered Jetpack sites for the purposes of this function.
 */
export default function isJetpackSitePred( options?: IsJetpackSitePredOptions ) {
	return function isJetpackSite( site: SiteDetails | null ): boolean | null {
		if ( ! site ) {
			return null;
		}

		// Merge default options with options.
		const mergedOptions = options ? { ...DEFAULT_OPTIONS, ...options } : DEFAULT_OPTIONS;

		if ( site.options?.is_wpcom_simple ) {
			return false;
		}

		// If the site is an Atomic site, but we should not treat it as Jetpack site, return false.
		if ( ! mergedOptions.treatAtomicAsJetpackSite && site.options?.is_wpcom_atomic ) {
			return false;
		}

		// Sites with full Jetpack plugin have a boolean `jetpack` property.
		if ( site.jetpack ) {
			return true;
		}

		// If we should not consider standalone products
		if ( ! mergedOptions.considerStandaloneProducts ) {
			return false;
		}

		return Boolean( site.options?.jetpack_connection_active_plugins?.length );
	};
}
