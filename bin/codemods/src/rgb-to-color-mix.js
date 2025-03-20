const fs = require( 'fs' );
const { glob } = require( 'glob' );

/**
 * RGB to color-mix
 *
 * Maps rgba() to color-mix(), e.g. `rgba(var(--color-primary-rgb), 0.04)` is replaced with `color-mix(in srgb, var(--color-primary) 4%, transparent)`.
 *
 * ## Usage
 *
 * node ./bin/codemods/src/rgb-to-color-mix.js ~/wp-calypso
 *
 * ## Notes:
 * - Not all rgba() usage is replaced, only those using *-rgb variables are replaced.
 * - This script does not handle all *-rgb variable replacement, additional changes are required.
 */

function replaceRgbVars( scssContent ) {
	return scssContent.replace(
		/rgba\(\s*var\((--[\w-]+)-rgb\)\s*,\s*([\d.]+)\s*\)/g,
		( match, varName, alpha ) => {
			const baseVar = varName.replace( /-rgb$/, '' );
			return `color-mix(in srgb, var(${ baseVar }) ${ parseFloat( alpha ) * 100 }%, transparent)`;
		}
	);
}

function processScssFiles( rootDir ) {
	const scssFiles = glob.sync( `${ rootDir }/**/*.scss` );

	console.log( `Processing ${ rootDir }/**/*.scss, found`, scssFiles.length, 'files' );

	scssFiles.forEach( ( filePath ) => {
		const scssCode = fs.readFileSync( filePath, 'utf8' );
		const fixedScssCode = replaceRgbVars( scssCode );

		if ( scssCode !== fixedScssCode ) {
			fs.writeFileSync( filePath, fixedScssCode, 'utf8' );
			console.log( `Fixed SCSS: ${ filePath }` );
		}
	} );
}

// Run the codemod with a specified directory
const rootDir = process.argv[ 2 ];

if ( ! rootDir ) {
	console.error( 'Usage: node fix-scss-rgb.js <scss_directory>' );
	process.exit( 1 );
}

processScssFiles( rootDir );
