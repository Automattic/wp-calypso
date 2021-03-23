// Checks if `currentPath` starts with the first fragment of `path`
export function itemLinkMatches( path, currentPath ) {
	// Accounts for jetpack custom post types, eg portofolio, testimonials.
	if ( currentPath.split( '/' )?.[ 1 ].includes( 'types' ) ) {
		return currentPath.split( '/' )?.[ 2 ] === path.split( '/' )?.[ 2 ];
	}
	// Temp fix till we remove sharing buttons from 'Settings' menu.
	if ( currentPath.split( '/' )?.[ 1 ].includes( 'marketing' ) ) {
		return (
			currentPath.split( '/' )?.[ 1 ] === path.split( '/' )?.[ 1 ] &&
			'tools' === path.split( '/' )?.[ 2 ]
		);
	}
	return currentPath.split( '/' )?.[ 1 ] === path.split( '/' )?.[ 1 ];
}
