/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const rimraf = require( 'rimraf' );
const webpack = require( 'webpack' );
const ConfigFlagPlugin = require( '..' );

const fixturesDirectory = path.join( __dirname, 'fixtures' );
const buildDirectory = path.join( __dirname, 'build' );

describe( 'webpack-config-flag-plugin', () => {
	beforeAll( () => {
		rimraf.sync( buildDirectory );
	} );

	afterAll( () => {
		rimraf.sync( buildDirectory );
	} );

	test( 'should produce expected output', () =>
		new Promise( ( done ) => {
			const config = {
				context: fixturesDirectory,
				entry: path.join( fixturesDirectory, 'main.js' ),
				mode: 'production',
				devtool: false,
				optimization: {
					runtimeChunk: true,
					moduleIds: 'named',
					chunkIds: 'named',
					minimize: false,
				},
				output: {
					path: buildDirectory,
					pathinfo: false,
					globalObject: 'window',
				},
				resolve: {
					extensions: [ '.js' ],
					modules: [ fixturesDirectory ],
					alias: {
						'@automattic/calypso-config': 'config',
					},
				},
				plugins: [ new ConfigFlagPlugin( { flags: { foo: true } } ) ],
			};

			webpack( config, ( err, stats ) => {
				expect( err ).toBeNull();
				expect( stats.compilation.errors ).toHaveLength( 0 );

				const outputFile = path.join( buildDirectory, 'main.js' );
				const outputFileContent = fs.readFileSync( outputFile, 'utf8' );
				expect( outputFileContent ).toMatchSnapshot( 'Output bundle should match snapshot' );

				done();
			} );
		} ) );
} );
