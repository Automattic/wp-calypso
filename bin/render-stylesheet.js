#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );
const { pathToFileURL } = require( 'url' );
const resolve = require( 'enhanced-resolve' );
const sass = require( 'sass' );
const yargs = require( 'yargs' );

// parse CLI, require --in and --out args
const args = yargs
	.usage( 'Usage: $0' )
	.option( 'in', { describe: 'Input file' } )
	.option( 'out', { describe: 'Output file' } )
	.demandOption( [ 'in', 'out' ] ).argv;

const projectRoot = path.resolve( __dirname, '..' );

// create a webpack-style resolver that finds SCSS files. Inspired by `sass-loader` resolver.
const resolver = resolve.create.sync( {
	conditionNames: [ 'sass', 'style' ],
	mainFields: [ 'sass', 'style', 'main' ],
	mainFiles: [ '_index', 'index' ],
	extensions: [ '.sass', '.scss', '.css' ],
	restrictions: [ /\.((sa|sc|c)ss)$/i ],
	preferRelative: true,
} );

// Resolve relative to the project root.
// Convert missing file exceptions into return values so the importer can fallback.
const rootResolver = ( tailPath ) => {
	try {
		return resolver( projectRoot, tailPath );
	} catch {
		return false;
	}
};

// `dart-sass` custom importer
const importer = {
	findFileUrl( url ) {
		// Strip the leading tilde.
		url = url.replace( /^~/, '' );

		// Sass treats `foo/bar` and `foo/_bar` as equivalent (partials), but
		// enhanced-resolve doesn't. Try the literal name first, then the
		// underscore-prefixed partial form.
		const dir = path.dirname( url );
		const base = path.basename( url );
		const result =
			rootResolver( url ) || rootResolver( dir === '.' ? `_${ base }` : `${ dir }/_${ base }` );

		if ( result ) {
			return pathToFileURL( result );
		}

		// If we can't resolve the module, let further importers resolve the original URL.
		return null;
	},
};

try {
	const output = sass.compile( args.in, {
		importers: [ importer ],
		loadPaths: [ path.join( projectRoot, 'node_modules' ) ],
		style: 'compressed',
		silenceDeprecations: [ 'mixed-decls' ],
		quietDeps: true,
	} );

	fs.writeFileSync( args.out, output.css );
} catch ( err ) {
	console.error( 'error', err );
	process.exitCode = 1;
}
