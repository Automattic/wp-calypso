import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

const pathIncludes = ( currentPath, term, position ) =>
	currentPath.split( /[/,?]/ )?.[ position ]?.includes( term );

const fragmentIsEqual = ( path, currentPath, position ) =>
	currentPath.split( /[/,?]/ )?.[ position ] === path.split( /[/,?]/ )?.[ position ];

const isManageAllSitesPluginsPath = ( path ) =>
	path.match( /^\/plugins\/(?:manage|active|inactive|updates)/ ) !== null;

/**
 * Checks if `currentPath` starts with the first fragment of `path`
 * @param {string} path The path to check against.
 * @param {string} currentPath The current path.
 * @returns {boolean} True if paths match, false otherwise.
 */
export const itemLinkMatches = ( path, currentPath ) => {
	// Accounts for jetpack custom post types, eg portfolio, testimonials.
	if ( pathIncludes( currentPath, 'types', 1 ) ) {
		return fragmentIsEqual( path, currentPath, 2 );
	}
	// Account for taxonomies, eg. tags, categories
	if ( pathIncludes( currentPath, 'taxonomies', 2 ) ) {
		return fragmentIsEqual( path, currentPath, 3 );
	}

	if ( pathIncludes( currentPath, 'people', 1 ) ) {
		if ( pathIncludes( currentPath, 'new', 2 ) ) {
			return fragmentIsEqual( path, currentPath, 2 );
		} else if (
			pathIncludes( currentPath, 'add-subscribers', 2 ) &&
			pathIncludes( path, 'team', 2 )
		) {
			return fragmentIsEqual( path, currentPath, 2 );
		} else if ( pathIncludes( currentPath, 'subscribers', 2 ) && pathIncludes( path, 'team', 2 ) ) {
			return fragmentIsEqual( path, currentPath, 1 );
		}
	}

	if ( pathIncludes( currentPath, 'settings', 1 ) ) {
		// Jetpack Cloud uses a simpler /settings/:site pattern for the settings page.
		if ( isJetpackCloud() ) {
			return fragmentIsEqual( path, currentPath, 1 );
		}

		/*
		 * If the menu item URL contains 'taxonomies', ignore it when on Settings screens.
		 * Taxonomies are located under the Posts parent menu; this prevents the Posts parent
		 * from being highlighted when Settings screens are active.
		 */
		if ( pathIncludes( currentPath, 'settings', 1 ) && pathIncludes( path, 'taxonomies', 2 ) ) {
			return false;
		}

		// Account for rest of settings pages.
		if ( fragmentIsEqual( currentPath, '/settings', 1 ) ) {
			return fragmentIsEqual( path, currentPath, 2 );
		}
	}

	// All URLs in the Licensing Portal start with 'partner-portal', so we need to compare them at the
	// second position (i.e., compare whatever comes after partner-portal/).
	if ( isJetpackCloud() && pathIncludes( currentPath, 'partner-portal', 1 ) ) {
		return fragmentIsEqual( path, currentPath, 2 );
	}

	// Account for plugins in all-sites view where '/plugins/manage' isn't a child view of '/plugins'.
	if ( isManageAllSitesPluginsPath( currentPath ) ) {
		return isManageAllSitesPluginsPath( path );
	}

	// For `/store/stats/*` and `/google-my-business/stats/*` paths, show Stats menu as selected.
	if (
		currentPath.startsWith( '/store/stats/' ) ||
		currentPath.startsWith( '/google-my-business/stats/' )
	) {
		return path.startsWith( '/stats/' );
	}

	return fragmentIsEqual( path, currentPath, 1 );
};
