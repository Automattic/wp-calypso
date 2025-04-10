const fs = require( 'fs' );
const { glob } = require( 'glob' );

/**
 * RGB to color-mix
 *
 * Maps rgba() to color-mix(), e.g. `rgba(var(--color-primary-rgb), 0.04)` is replaced with `color-mix(in srgb, var(--color-primary) 4%, transparent)`.
 * Maps rgba() to var(), e.g. `rgba(var(--color-primary-rgb))` is replaced with `var(--color-primary)`.
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
	// First replace simple rgb() cases (no alpha value)
	scssContent = scssContent.replace(
		/rgba\s*\(\s*var\s*\(\s*(--[\w-]+?)(?:--rgb|-rgb)\s*\)\s*\)/g,
		( match, varName ) => {
			return `var(${ varName })`;
		}
	);

	// Handle rgba() cases with both decimal and percentage alpha values
	return scssContent.replace(
		/rgba\s*\(\s*var\s*\(\s*(--[\w-]+?)(?:--rgb|-rgb)\s*\)\s*,\s*([\d.]+)(%?)\s*\)/g,
		( match, varName, alpha, isPercent ) => {
			const alphaValue = isPercent
				? parseFloat( alpha )
				: Number( ( parseFloat( alpha ) * 100 ).toPrecision( 10 ) );
			return `color-mix(in srgb, var(${ varName }) ${ alphaValue }%, transparent)`;
		}
	);
}

function processScssFiles( rootDir ) {
	const scssFiles = glob.sync( `${ rootDir }/**/*.scss`, {
		ignore: [ '**/node_modules/**' ],
	} );

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
