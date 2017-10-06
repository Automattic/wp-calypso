/**
 * Find all JS and JSX files in the project that have the @format tag
 * and reformat them with Prettier. Useful when upgrading Prettier to
 * a newer version.
 * @format
 */
const fs = require( 'fs' );
const glob = require( 'glob' );
const ignore = require( 'ignore' );
const path = require( 'path' );
const prettier = require( 'prettier' );
const docblock = require( 'docblock' );

/**
 * Returns true if the given text contains @format.
 * within its first docblock. False otherwise.
 *
 * @param {String} text text to scan for the format keyword within the first docblock
 */
const shouldFormat = text => 'format' in docblock.parse( docblock.extract( text ) );

// Load ignore file
const ignoreFile = fs.readFileSync( '.eslintignore', 'utf-8' );
const ig = ignore().add( ignoreFile );

// List .js and .jsx files in the current directory
const files = glob.sync( '**/*.{js,jsx}', {
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

	const formattedText = prettier.format( text, {} );

	// did the re-formatting change anything?
	if ( formattedText === text ) {
		return;
	}

	fs.writeFileSync( file, formattedText );
	console.log( `Prettier reformatted file: ${ file }` );
} );
