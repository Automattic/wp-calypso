#!/usr/bin/env node

const fs = require( 'fs' );
const path = require( 'path' );
const glob = require( 'glob' );

const PROJECT_DIR = path.resolve( __dirname, '..' );
const ROOT_DIR = path.resolve( PROJECT_DIR, '..', '..' );
const CHUNKS_MAP_PATHS = glob.sync(
	path.resolve( PROJECT_DIR, 'block-library/*/build/', 'chunks-map.json' )
);
const CALYPSO_STRINGS_PATH = path.resolve( PROJECT_DIR, 'dist', 'calypso-strings.pot' );
const OUTPUT_PATH = path.resolve( PROJECT_DIR, 'translations-manifest.json' );

const calypsoStrings = fs.readFileSync( CALYPSO_STRINGS_PATH, {
	encoding: 'utf8',
} );
const stringRefs = new Set( calypsoStrings.match( /(?<=#:\s).+(?=:\d+)/gm ) );
let translationsRefs = {};

CHUNKS_MAP_PATHS.map( ( CHUNKS_MAP_PATH ) => {
	const pathSegments = CHUNKS_MAP_PATH.split( path.sep );
	const chunksMap = JSON.parse(
		fs.readFileSync( CHUNKS_MAP_PATH, {
			encoding: 'utf8',
		} )
	);

	translationsRefs = {
		...translationsRefs,
		...Object.fromEntries(
			Object.entries( chunksMap ).map( ( [ filename, refs ] ) => {
				// Paths relative to the root directory and filtered to intersect with calypso-strings.pot refs.
				const normalizedRefs = refs
					.map( ( ref ) => path.relative( ROOT_DIR, ref ) )
					.filter( ( ref ) => stringRefs.has( ref ) );
				const key = 'block-library/' + pathSegments[ pathSegments.length - 3 ] + '/' + filename;
				return [ key, normalizedRefs ];
			} )
		),
	};

	fs.unlinkSync( CHUNKS_MAP_PATH );
} );

// Write translatios manifest file.
fs.writeFileSync( OUTPUT_PATH, JSON.stringify( { references: translationsRefs } ) );

// Clean up.
fs.unlinkSync( CALYPSO_STRINGS_PATH );
