/**
 * External dependencies
 */
const path = require( 'path' );
const { promisify } = require( 'util' );
const rimraf = promisify( require( 'rimraf' ) );
const webpack = promisify( require( 'webpack' ) );

/**
 * Internal dependencies
 */
const config = require( './fixtures/webpack.config.js' );

describe( 'LibraryExportDefaultPlugin', () => {
	const buildDir = path.join( __dirname, '/fixtures/build' );

	beforeAll( async () => {
		await rimraf( buildDir );
		await webpack( config );
	} );

	test( 'the default export of boo entry point is assigned to the library target', () => {
		require( './fixtures/build/boo' );

		expect( window.wp.boo() ).toBe( 'boo' );
	} );

	test( 'the default export of foo entry point is not assigned to the library target', () => {
		require( './fixtures/build/foo' );

		expect( window.wp.foo.default() ).toBe( 'foo' );
	} );
} );
