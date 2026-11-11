#!/usr/bin/env node

// `yarn install` builds the workspace packages with `tsc --build packages/tsconfig.json`,
// so a package whose types live in `dist/` only gets them if that file references it,
// directly or through another package. Without the reference, a fresh checkout fails
// `yarn typecheck-client` with "Cannot find module" as soon as something imports the package.

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

const PACKAGES_DIR = path.join( process.cwd(), 'packages' );
const ROOT_TSCONFIG = path.join( PACKAGES_DIR, 'tsconfig.json' );

function readTsconfig( file ) {
	const { config, error } = ts.readConfigFile( file, ts.sys.readFile );
	if ( error ) {
		console.error( ts.flattenDiagnosticMessageText( error.messageText, '\n' ) );
		process.exit( 1 );
	}
	return config;
}

function collectReferencedPackages( file, seen = new Set() ) {
	if ( seen.has( file ) ) {
		return seen;
	}
	seen.add( file );
	for ( const { path: reference } of readTsconfig( file ).references ?? [] ) {
		const target = path.resolve( path.dirname( file ), reference );
		const referenced = target.endsWith( '.json' ) ? target : path.join( target, 'tsconfig.json' );
		if ( ! fs.existsSync( referenced ) ) {
			// `tsc --build` fails on this too, so `yarn install` would stop here.
			console.error(
				`${ path.relative( process.cwd(), file ) } references "${ reference }", which has no tsconfig.json. ` +
					'Remove the reference or restore the package.'
			);
			process.exit( 1 );
		}
		collectReferencedPackages( referenced, seen );
	}
	return seen;
}

function hasBuiltTypes( { types, typings, exports: packageExports } ) {
	const entries = [ types, typings ];
	if ( packageExports && typeof packageExports === 'object' ) {
		entries.push( ...Object.values( packageExports ).map( ( entry ) => entry?.types ) );
	}
	return entries.some(
		( entry ) => typeof entry === 'string' && /^(\.\/)?dist(\/|$)/.test( entry )
	);
}

const referenced = new Set(
	[ ...collectReferencedPackages( ROOT_TSCONFIG ) ].map(
		( file ) => path.relative( PACKAGES_DIR, file ).split( path.sep )[ 0 ]
	)
);

const missing = fs.readdirSync( PACKAGES_DIR ).filter( ( name ) => {
	const manifest = path.join( PACKAGES_DIR, name, 'package.json' );
	return (
		! referenced.has( name ) &&
		fs.existsSync( manifest ) &&
		fs.existsSync( path.join( PACKAGES_DIR, name, 'tsconfig.json' ) ) &&
		hasBuiltTypes( JSON.parse( fs.readFileSync( manifest, 'utf8' ) ) )
	);
} );

if ( missing.length ) {
	console.error(
		'These packages publish their types from dist/ but packages/tsconfig.json does not reference them, ' +
			'so `yarn install` never builds them and a fresh checkout cannot type-check code that imports them:\n'
	);
	for ( const name of missing ) {
		console.error( `  { "path": "./${ name }" },` );
	}
	console.error( '\nAdd the lines above to "references" in packages/tsconfig.json.' );
	process.exit( 1 );
}

console.log( 'packages/tsconfig.json references every package that builds its types.' );
