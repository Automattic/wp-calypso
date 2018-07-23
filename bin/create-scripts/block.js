/** @format */
const path = require( 'path' );
const webpack = require( 'webpack' );

// TODO: move this to the npm script, see #26258
process.env[ 'SKIP_FLAG_IMAGES' ] = 'true';

const __rootDir = path.resolve( __dirname, '../../' );
const entryPath = path.resolve( process.argv[ 2 ] );
const sourceDir = path.dirname( entryPath );
const outputDir = path.join( sourceDir, 'build' );
const blockName = path.basename( path.dirname( entryPath ) );

const baseConfig = require( path.join( __rootDir, 'webpack.config.js' ) );

const config = {
	...baseConfig,
	...{
		mode: 'production',
		entry: entryPath,
		externals: {
			...baseConfig.externals,
			wp: 'wp',
		},
		optimization: {
			splitChunks: false,
		},
		output: {
			path: outputDir,
			filename: `blocks-${ blockName }.js`,
			libraryTarget: 'window',
			library: `blocks-${ blockName }`,
		},
	},
};

const compiler = webpack( config );

compiler.run( ( error, stats ) => console.log( stats.toString() ) );
