const pathIncludes = ( currentPath, term, position ) =>
	currentPath.split( /[/,?]/ )?.[ position ]?.includes( term );

const fragmentIsEqual = ( path, currentPath, position ) =>
	currentPath.split( /[/,?]/ )?.[ position ] === path.split( /[/,?]/ )?.[ position ];

/**
 * Checks if `currentPath` starts with the first fragment of `path`
 *
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
	/*
	 * If the menu item URL contains 'taxonomies', ignore it when on Settings screens.
	 * Taxonomies are located under the Posts parent menu; this prevents the Posts parent
	 * from being highlighted when Settings screens are active.
	 */
	if ( pathIncludes( currentPath, 'settings', 1 ) && pathIncludes( path, 'taxonomies', 2 ) ) {
		return false;
	}

	return fragmentIsEqual( path, currentPath, 1 );
};
