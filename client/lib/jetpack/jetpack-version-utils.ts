/**
 * Checks if the given Jetpack version supports My Jetpack for multisites.
 * @param jetpackVersion The Jetpack version string (e.g., "14.9-a.3")
 * @returns true if version is 14.9 or later, false otherwise
 */
const isJetpackVersionSupported = ( jetpackVersion?: string ): boolean => {
	if ( ! jetpackVersion ) {
		return false;
	}

	// Extract major.minor version (e.g., "14.9" from "14.9-a.3")
	const versionMatch = jetpackVersion.match( /^(\d+)\.(\d+)/ );
	if ( ! versionMatch ) {
		return false;
	}

	const major = parseInt( versionMatch[ 1 ], 10 );
	const minor = parseInt( versionMatch[ 2 ], 10 );

	// Check if version is 14.9 or later
	return major > 14 || ( major === 14 && minor >= 9 );
};

/**
 * Determines whether to use Dashboard page or My Jetpack based on site conditions.
 * @param isMultisite Whether the site is a multisite installation (fail safe, check the version if it cannot be detected)
 * @param jetpackVersion The Jetpack version string (My Jetpack support multi-sites from 14.9+)
 * @param redirectToContainsDashboard Whether redirect_to explicitly requests Dashboard
 * @returns true if should use Dashboard (page=jetpack), false if should use My Jetpack (page=my-jetpack)
 */
export const shouldUseDashboardPage = (
	isMultisite?: boolean,
	jetpackVersion?: string,
	redirectToContainsDashboard?: boolean
): boolean =>
	!! redirectToContainsDashboard ||
	( false !== isMultisite && ! isJetpackVersionSupported( jetpackVersion ) );
