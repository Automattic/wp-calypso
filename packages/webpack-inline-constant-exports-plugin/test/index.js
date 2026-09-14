const fs = require( 'fs' );
const path = require( 'path' );
const { promisify } = require( 'util' );
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

	test( 'should produce expected output', async () => {
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

		// promisify rejects on webpack's error-first callback arg; assertions run
		// in the async body, so a failure fails fast instead of hanging.
		const stats = await promisify( webpack )( config );
		// Compilation errors surface via stats, not the callback err arg, so a
		// broken build would otherwise snapshot silently.
		expect( stats.hasErrors() ).toBe( false );

		const outputFile = path.join( outputDirectory, 'main.js' );
		const outputFileContent = fs.readFileSync( outputFile, 'utf8' );
		expect( outputFileContent ).toMatchSnapshot( 'Output bundle should match snapshot' );
	}, 30000 );
} );
