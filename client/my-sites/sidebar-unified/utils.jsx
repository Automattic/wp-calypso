// Checks if `currentPath` starts with the first fragment of `path`

const pathIncludes = ( currentPath, position, term ) =>
	currentPath.split( /[/,?]/ )?.[ position ].includes( term );

const fragmentIsEqual = ( currentPath, path, position ) =>
	currentPath.split( /[/,?]/ )?.[ position ] === path.split( /[/,?]/ )?.[ position ];

export const itemLinkMatches = ( path, currentPath ) => {
	// Accounts for jetpack custom post types, eg portofolio, testimonials.
	if ( pathIncludes( currentPath, 1, 'types' ) ) {
		fragmentIsEqual( currentPath, path, 2 );
	}
	// Temp fix till we remove sharing buttons from 'Settings' menu.
	if ( pathIncludes( currentPath, 1, 'marketing' ) ) {
		return fragmentIsEqual( currentPath, path, 1 ) && fragmentIsEqual( currentPath, '//tools', 2 );
	}
	return fragmentIsEqual( currentPath, path, 1 );
};
