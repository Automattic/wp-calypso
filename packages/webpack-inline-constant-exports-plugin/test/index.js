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

	test( 'should produce expected output', () => {
		return new Promise( ( resolve, reject ) => {
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
					globalObject: 'window',
				},
				plugins: [
					new InlineConstantExportsPlugin( [
						/\/actions\.js$/,
						/\/plans\.js$/,
						/\/constants\.js$/,
						/\/constants2\.js$/,
						/\/export\.js$/,
					] ),
				],
			};

			webpack( config, ( err ) => {
				// Resolve/reject explicitly: throwing inside this callback would
				// otherwise leave the Promise pending and hang until the timeout
				// instead of failing fast on the assertion.
				try {
					expect( err ).toBeNull();

					const outputFile = path.join( outputDirectory, 'main.js' );
					const outputFileContent = fs.readFileSync( outputFile, 'utf8' );
					expect( outputFileContent ).toMatchSnapshot( 'Output bundle should match snapshot' );

					resolve();
				} catch ( error ) {
					reject( error );
				}
			} );
		} );
	}, 30000 );
} );
