/** @format */

/**
 * External dependencies
 */
const fs = require( 'fs' );
const glob = require( 'glob' );
const ignore = require( 'ignore' );
const path = require( 'path' );
const prettier = require( 'prettier' );

/**
 * Internal dependencies
 */
const shouldFormat = require( './utils/should-format' );

/**
 * Module constants
 */
const defaultPrettierConfig = undefined;
const sassPrettierConfig = { parser: 'scss' };

/**
 * Find all JS and JSX files in the project that have the @format tag
 * and reformat them with Prettier. Useful when upgrading Prettier to
 * a newer version.
 */

// Load ignore file
const ignoreFile = fs.readFileSync( '.eslintignore', 'utf-8' );
const ig = ignore().add( ignoreFile );

// List .js and .jsx files in the current directory
const files = glob.sync( '**/*.{js,jsx,scss}', {
	ignore: 'node_modules/**', // ignore node_modules by default
	nodir: true,
} );

files.forEach( file => {
	// skip ignored files
	if ( ig.ignores( file ) ) {
		return;
	}

	const text = fs.readFileSync( file, 'utf8' );

	// skip if the first docblock doesn't have @format tag
	if ( ! shouldFormat( text ) ) {
		return;
	}

	const formattedText = prettier.format(
		text,
		file.endsWith( '.scss' ) ? sassPrettierConfig : defaultPrettierConfig
	);

	// did the re-formatting change anything?
	if ( formattedText === text ) {
		return;
	}

	fs.writeFileSync( file, formattedText );
	console.log( `Prettier reformatted file: ${ file }` );
} );
