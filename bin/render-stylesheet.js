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

// create a webpack-style resolver that finds SCSS files. Inspired by `sass-loader` resolver.
const resolver = resolve.create.sync( {
	conditionNames: [ 'sass', 'style' ],
	mainFields: [ 'sass', 'style', 'main' ],
	mainFiles: [ '_index', 'index' ],
	extensions: [ '.sass', '.scss', '.css' ],
	restrictions: [ /\.((sa|sc|c)ss)$/i ],
	preferRelative: true,
} );

// Handles bare-module (`@scope/pkg`, `pkg/path`), project-root-relative (`client/foo/bar`)
// and `~`-prefixed imports by resolving via webpack's enhanced-resolve from the project root.
const tryResolve = ( request ) => {
	try {
		return resolver( process.cwd(), request );
	} catch {
		return null;
	}
};

// `dart-sass` custom importer
const importer = {
	findFileUrl( url ) {
		// Sass handles `./` and `../` imports itself, so we skip those.
		if ( url.startsWith( '.' ) ) {
			return null;
		}
		// Strip the leading tilde.
		url = url.replace( /^~/, '' );
		// Sass treats `foo/bar` and `foo/_bar` as equivalent (partials), but
		// enhanced-resolve doesn't. Try the literal name first, then the
		// underscore-prefixed partial form.
		const dir = path.dirname( url );
		const base = path.basename( url );
		const result =
			tryResolve( url ) || tryResolve( dir === '.' ? `_${ base }` : `${ dir }/_${ base }` );
		return result ? pathToFileURL( result ) : null;
	},
};

sass
	.compileAsync( args.in, {
		importers: [ importer ],
		loadPaths: [ 'node_modules' ],
		style: 'compressed',
		silenceDeprecations: [ 'mixed-decls' ],
		quietDeps: true,
	} )
	.then(
		( output ) => fs.writeFileSync( args.out, output.css ),
		( err ) => {
			console.error( 'error', err );
			process.exitCode = 1;
		}
	);
