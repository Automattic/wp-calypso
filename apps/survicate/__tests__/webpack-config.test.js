const path = require( 'path' );
const getWebpackConfig = require( '../webpack.config' );

function getExtractionPlugin( config ) {
	return config.plugins.find(
		( plugin ) => plugin.constructor.name === 'DependencyExtractionWebpackPlugin'
	);
}

describe( 'wp-admin Survicate webpack config', () => {
	const config = getWebpackConfig( {}, {} );

	it( 'keeps only @wordpress/data external so the cached manifest never goes stale', () => {
		const { options } = getExtractionPlugin( config );

		expect( options.useDefaults ).toBe( false );
		expect( options.requestToExternal( '@wordpress/data' ) ).toEqual( [ 'wp', 'data' ] );
		expect( options.requestToHandle( '@wordpress/data' ) ).toBe( 'wp-data' );
		expect( options.requestToExternal( '@wordpress/compose' ) ).toBeUndefined();
		expect( options.requestToExternal( 'react' ) ).toBeUndefined();
	} );

	it( 'replaces calypso-analytics with the no-op stub', () => {
		expect( config.resolve.alias[ '@automattic/calypso-analytics$' ] ).toBe(
			path.join( __dirname, '..', 'calypso-analytics-stub.js' )
		);
	} );
} );
