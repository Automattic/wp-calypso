const path = require( 'path' );

const bundledPrivateApis = path.join(
	path.dirname( require.resolve( '@wordpress/private-apis/package.json' ) ),
	require( '@wordpress/private-apis/package.json' ).module
);

// A file path, unlike the package name, isn't turned into the `wp-private-apis` external.
module.exports = function bundlePrivateApisLoader( source ) {
	const result = source.replace(
		/(["'])@wordpress\/private-apis\1/,
		JSON.stringify( bundledPrivateApis )
	);

	if ( result === source ) {
		throw new Error( 'Expected a @wordpress/private-apis import to bundle, but found none.' );
	}

	return result;
};
