#!/usr/bin/env node

const m = require( 'module' );

// Create an instance of `require` with its root in the `@wordpress/element` module.
const requireFromWpElement = m.createRequireFromPath( require.resolve( '@wordpress/element' ) );

// We should get the same module requiring from the root or from @wordpress/element
if ( require( 'react' ) === requireFromWpElement( 'react' ) ) {
	process.exit( 0 );
} else {
	const reactRootVersion = require( 'react/package.json' ).version;
	const reactWpElementVersion = requireFromWpElement( 'react/package.json' ).version;
	throw new Error(
		`Encountered different versions of React between the root and @wordpress/element: ${ reactRootVersion } (root) vs. ${ reactWpElementVersion }`
	);
}
