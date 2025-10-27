import type { Site } from '@automattic/api-core';

export function isSelfHostedJetpackConnected( site: Site ) {
	return (
		site.jetpack_connection && ! site.is_wpcom_atomic && ! site.is_wpcom_flex && ! site.is_garden
	);
}

export function isP2( site: Site ) {
	return !! site.options?.p2_hub_blog_id || site.options?.is_wpforteams_site;
}

export function isSimple( site: Site ) {
	return ! site.jetpack && ! site.is_wpcom_atomic && ! site.is_garden;
}

export function isGarden( site: Site ) {
	return site.is_garden;
}

export function isCommerceGarden( site: Site ) {
	return site.is_garden && site.garden_name === 'commerce';
}

export function isStagingSite( site: Site ) {
	return site.is_wpcom_staging_site;
}

/**
 * Returns true if site is a Automated Transfer site, false if not and null if unknown
 */
//used
export function isSiteAutomatedTransfer( site: Site | undefined | null ): boolean | null {
	if ( ! site ) {
		return null;
	}

	return site?.is_wpcom_atomic ?? site?.options?.is_automated_transfer ?? null;
}

export function isAtomicSite( site: Site | undefined | null ): boolean | null {
	return isSiteAutomatedTransfer( site );
}

type IsJetpackSitePredOptions = {
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
function isJetpackSitePred( options?: IsJetpackSitePredOptions ) {
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

/**
 * Returns true if site is a Jetpack site, false if the site is hosted on
 * WordPress.com, or null if the site is unknown.
 *
 * When options.considerStandaloneProducts is true (the default), sites with
 * Jetpack standalone plugins will also be considered Jetpack sites for the
 * purposes of this function.
 *
 * When options.treatAtomicAsJetpackSite is true (the default), Atomic sites with
 * Jetpack will also be considered Jetpack sites for the purposes of this function.
 */
//used
export function isJetpackSite(
	site: Site | undefined | null,
	options?: IsJetpackSitePredOptions
): boolean | null {
	if ( ! site ) {
		return null;
	}

	return isJetpackSitePred( options )( site );
}
