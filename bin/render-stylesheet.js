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

// webpack-style resolver, used for `~package/...` style imports.
const resolver = resolve.create.sync( {
	conditionNames: [ 'sass', 'style' ],
	mainFields: [ 'sass', 'style', 'main' ],
	mainFiles: [ '_index', 'index' ],
	extensions: [ '.sass', '.scss', '.css' ],
	restrictions: [ /\.((sa|sc|c)ss)$/i ],
	preferRelative: true,
} );

// Modern-API importer. Handles bare-module (`@scope/pkg`,
// `pkg/path`), project-root-relative (`client/foo/bar`), and `~`-prefixed
// imports by resolving via webpack's enhanced-resolve from the project root.
// Sass handles `./` and `../` imports itself, so we skip those.
const tryResolve = ( request ) => {
	try {
		return resolver( process.cwd(), request );
	} catch {
		return null;
	}
};

const importer = {
	findFileUrl( url ) {
		if ( url.startsWith( '.' ) ) {
			return null;
		}
		const stripped = url.replace( /^~/, '' );
		// Sass treats `foo/bar` and `foo/_bar` as equivalent (partials), but
		// enhanced-resolve doesn't. Try the literal name first, then the
		// underscore-prefixed partial form.
		const dir = path.dirname( stripped );
		const base = path.basename( stripped );
		const result =
			tryResolve( stripped ) || tryResolve( dir === '.' ? `_${ base }` : `${ dir }/_${ base }` );
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
