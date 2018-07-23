/** @format */
const path = require( 'path' );
const webpack = require( 'webpack' );
const fs = require( 'fs' );
const sass = require( 'node-sass' );

const __rootDir = path.resolve( __dirname, '../../' );
const entryPath = path.resolve( path.join( process.argv[ 2 ], 'index.js' ) );
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

const cssOutFile = path.resolve( outputDir, `blocks-${ blockName }.css` );
sass.render(
	{
		file: path.resolve( sourceDir, 'style.scss' ),
		outFile: cssOutFile,
		sourceMap: true,
		outputStyle: 'compressed',
	},
	( error, result ) => {
		if ( error ) {
			console.warn( 'Failed to process SCSS', blockName, error );
			return;
		}

		console.log( 'Rendering Complete, saving .css file...' );

		fs.writeFile( cssOutFile, result.css, fileError => {
			if ( fileError ) {
				console.warn( 'Failed to save CSS', blockName, fileError );
				return;
			}
			console.log( 'Wrote CSS to ' + cssOutFile );
		} );

		fs.writeFile( cssOutFile + '.map', result.map, fileError => {
			if ( fileError ) {
				console.warn( 'Failed to save sourcemap', blockName, fileError );
				return;
			}
			console.log( 'Wrote Source Map to ' + cssOutFile + '.map' );
		} );
	}
);
