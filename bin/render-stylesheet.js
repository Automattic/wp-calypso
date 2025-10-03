#!/usr/bin/env node

const fs = require( 'fs' );
const resolve = require( 'enhanced-resolve' );
const sass = require( 'sass' );
const yargs = require( 'yargs' );

// parse CLI, require --in and --out args
const args = yargs
	.usage( 'Usage: $0' )
	.option( 'in', { describe: 'Input file' } )
	.option( 'out', { describe: 'Output file' } )
	.demandOption( [ 'in', 'out' ] ).argv;

// create a webpack resolver that finds SCSS files. Inspired by `sass-loader` resolver.
const resolver = resolve.create( {
	conditionNames: [ 'sass', 'style' ],
	mainFields: [ 'sass', 'style', 'main' ],
	mainFiles: [ '_index', 'index' ],
	extensions: [ '.sass', '.scss', '.css' ],
	restrictions: [ /\.((sa|sc|c)ss)$/i ],
	preferRelative: true,
} );

// `dart-sass` custom importer
const importer = ( url, prev, done ) => {
	// Strip the leading tilde.
	url = url.replace( /^~/, '' );
	resolver( prev, url, ( error, result ) => {
		if ( error ) {
			// If webpack can't resolve the module, let further importers resolve the original URL.
			done( { file: url } );
		} else {
			// Resolve with the webpack result.
			done( { file: result } );
		}
	} );
};

sass.render(
	{
		file: args.in,
		importer,
		outputStyle: 'compressed',
		includePaths: [ 'node_modules' ],
	},
	( err, output ) => {
		if ( err ) {
			console.error( 'error', err );
			return;
		}
		fs.writeFileSync( args.out, output.css );
	}
);
