/**
 * External dependencies
 */
const fs = require( 'fs' );
const path = require( 'path' );
const rimraf = require( 'rimraf' );
const webpack = require( 'webpack' );
const InlineConstantExportsPlugin = require( '..' );

describe( 'webpack-inline-constant-exports-plugin', () => {
	const fixturesDirectory = path.join( __dirname, 'fixtures' );
	const buildDirectory = path.join( __dirname, 'build' );

	beforeAll( () => {
		rimraf.sync( buildDirectory );
	} );

	afterAll( () => {
		rimraf.sync( buildDirectory );
	} );

	test( 'should produce expected output', ( done ) => {
		const inputDirectory = path.join( fixturesDirectory, 'basic' );
		const outputDirectory = path.join( buildDirectory, 'basic' );
		const config = {
			context: inputDirectory,
			entry: './index.js',
			mode: 'production',
			optimization: {
				runtimeChunk: true,
				moduleIds: 'named',
				chunkIds: 'named',
				minimize: false,
			},
			output: {
				path: outputDirectory,
			},
			plugins: [
				new InlineConstantExportsPlugin( [ /\/actions\.js$/, /\/plans\.js$/, /\/constants\.js$/ ] ),
			],
		};

		webpack( config, ( err ) => {
			expect( err ).toBeNull();

			const outputFile = path.join( outputDirectory, 'main.js' );
			const outputFileContent = fs.readFileSync( outputFile, 'utf8' );
			expect( outputFileContent ).toMatchSnapshot( 'Output bundle should match snapshot' );

			done();
		} );
	} );
} );
