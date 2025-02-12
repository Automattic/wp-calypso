import isA8CForAgencies from 'calypso/lib/a8c-for-agencies/is-a8c-for-agencies';
import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';

const pathIncludes = ( currentPath, term, position ) =>
	currentPath.split( /[/,?]/ )?.[ position ]?.includes( term );

const fragmentIsEqual = ( path, currentPath, position ) =>
	currentPath.split( /[/,?]/ )?.[ position ] === path.split( /[/,?]/ )?.[ position ];

const isManageAllSitesPluginsPath = ( path ) =>
	path.match( /^\/plugins\/(?:manage|active|inactive|updates|scheduled-updates)/ ) !== null;

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

	if ( pathIncludes( currentPath, 'plugins', 1 ) ) {
		if ( pathIncludes( currentPath, 'scheduled-updates', 2 ) ) {
			return pathIncludes( path, 'plugins', 1 ) && pathIncludes( path, 'scheduled-updates', 2 );
		}

		return pathIncludes( path, 'plugins', 1 ) && fragmentIsEqual( path, currentPath, 1 );
	}

	if ( pathIncludes( currentPath, 'settings', 1 ) ) {
		// Jetpack Cloud uses a simpler /settings/:site pattern, and A4A uses /settings/:tab, for the settings page.
		if ( isJetpackCloud() || isA8CForAgencies() ) {
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
		if ( pathIncludes( currentPath, 'settings', 1 ) ) {
			return fragmentIsEqual( path, currentPath, 2 );
		}
	}

	// All URLs in the Licensing Portal start with 'partner-portal', so we need to compare them at the
	// second position (i.e., compare whatever comes after partner-portal/).
	if ( isJetpackCloud() && pathIncludes( currentPath, 'partner-portal', 1 ) ) {
		const isAssignLicensePath = pathIncludes( currentPath, 'assign-license', 2 );

		// For Assign license path, we will override it to be license path.
		if ( isAssignLicensePath ) {
			return fragmentIsEqual( path, '/partner-portal/licenses', 2 );
		}

		return fragmentIsEqual( path, currentPath, 2 );
	}

	// All URLs in the A4A Purchases start with 'purchases' or 'marketplace' will need to compare at the second position.
	if (
		isA8CForAgencies() &&
		( pathIncludes( currentPath, 'purchases', 1 ) ||
			pathIncludes( currentPath, 'marketplace', 1 ) ||
			pathIncludes( currentPath, 'client', 1 ) )
	) {
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

	// For `/theme/*` paths, show Themes menu as selected.
	if ( pathIncludes( currentPath, 'theme', 1 ) ) {
		return pathIncludes( path, 'themes', 1 );
	}

	return fragmentIsEqual( path, currentPath, 1 );
};

/**
 * Checks if the current menu item should be selected for a given path.
 * @param {Object} menuItem The current menu item.
 * @param {string} path The path to check against.
 * @param {string} site The current site.
 * @param {boolean} isP2Site True if this site is a P2, false otherwise.
 * @returns {boolean} True if the current menu item should be selected, false otherwise.
 */
export const isItemSelected = ( menuItem, path, site, isP2Site = false ) => {
	let isSelected = menuItem?.url && itemLinkMatches( menuItem.url, path );

	if (
		isSelected ||
		! [ 'sites', 'sites-p2' ].includes( menuItem.slug ) ||
		! site ||
		path.startsWith( '/domains' )
	) {
		return isSelected;
	}

	// Ensure the Sites and P2s icons are selected as appropriate.
	if ( menuItem.slug === 'sites' && ! isP2Site ) {
		isSelected = true;
	} else if ( menuItem.slug === 'sites-p2' && isP2Site ) {
		isSelected = true;
	}

	return isSelected;
};
