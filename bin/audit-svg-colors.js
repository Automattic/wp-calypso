#!/usr/bin/env node

/**
 * The script looks for all colors used in the SVG images found in the repository
 * and suggests Color Studio replacements for all non-standard values it finds.
 *
 * Please note that the suggestions are automatic and therefore not perfect
 * in some edge cases. Make sure to manually review the files you edit.
 *
 * List all non-standard color values by image path:
 * $ node ./bin/audit-svg-colors.js
 */

const { execSync } = require( 'child_process' );
const { readFileSync } = require( 'fs' );
const path = require( 'path' );
const PALETTE = require( '@automattic/color-studio' );
const chroma = require( 'chroma-js' );

/**
 * Native Sort - replacement of _.sortBy Lodash function
 * @returns Sorted array.
 */
const compareByName = ( objA, objB ) => {
	if ( objA.to.name > objB.to.name ) {
		return 1;
	} else if ( objB.to.name > objA.to.name ) {
		return -1;
	}
	return 0;
};

/**
 * Palette color subsets
 */

/**
 * pickBy function is a replacement for the Lodash _.pickby
 *
 */
const pickBy = ( palette, fn ) =>
	Object.keys( palette ?? {} )
		.filter( ( key ) => fn( palette[ key ], key ) )
		.reduce( ( acc, key ) => ( ( acc[ key ] = palette[ key ] ), acc ), {} );

// The subset of palette colors allowed in illustrations
const PALETTE_ILLUSTRATION_COLORS = pickBy( PALETTE.colors, ( colorValue, colorName ) => {
	// Avoid using pure black
	if ( colorValue === '#000' ) {
		return;
	}
	// Avoid specific colors for illustration use
	return ! colorName.startsWith( 'Simplenote Blue' );
} );

// The subset of palette colors used in app-related images is slightly wider
// than what we allow for in illustration use (the above)
const PALETTE_APP_COLORS = pickBy( PALETTE.colors, ( colorValue, colorName ) => {
	// Avoid using pure black
	if ( colorValue === '#000' ) {
		return;
	}
	// Don’t use brand colors for any WordPress.com app images
	return ! (
		colorName.startsWith( 'Simplenote Blue' ) ||
		colorName.startsWith( 'WooCommerce Purple' ) ||
		colorName.startsWith( 'WordPress Blue' )
	);
} );

// Making sure both sets contain only unique color values
// (the palette defines aliases for some colors)
const PALETTE_ILLUSTRATION_COLOR_VALUES = [
	...new Set( Object.values( PALETTE_ILLUSTRATION_COLORS ) ),
];
const PALETTE_APP_COLOR_VALUES = [ ...new Set( Object.values( PALETTE_APP_COLORS ) ) ];

/**
 * SVG image rules
 */

// The image paths that match the following patterns will not be processed
const SVG_IGNORE_PATHS = [
	// Logos found in the repository
	/(?:billcom|canva|cloudflare|evernote|facebook-messenger|fiverr|google-photos|monday|paypal|quickbooks|sendinblue|stripe|todoist|vaultpress)(-logo)?\.svg$/,
	/images\/g-suite\/logo_/,
	/images\/email-providers\/google-workspace/,

	// Illustrations that contain logos
	/images\/customer-home\/illustration--task-connect-social-accounts.svg/,

	// Credit card and payment gateway logos (the disabled versions are allowed)
	/upgrades\/cc-(?:amex|diners|discover|jcb|mastercard|unionpay|visa)\.svg$/,
	/upgrades\/(?:alipay|bancontact|emergent-paywall|eps|ideal|netbanking|p24|paypal|paytm|sofort|tef|wechat|razorpay)/,

	// Color scheme thumbnails that rely on .org colors
	/color-scheme-thumbnail-(?:blue|classic-dark|coffee|ectoplasm|light|modern|ocean|sunrise)\.svg$/,

	// Old WooCommerce mascotte
	/ninja-joy\.svg$/,

	// Specific images directories
	/^static\/images\/marketing/,
	/^static\/images\/me/,
	/^static\/images\/illustrations\/illustration-woo-magic-link.svg/,
	/^static\/images\/jetpack\/favicons/,

	// Documentation
	/^docs/,
	/^client\/my-sites\/checkout\/docs/,
];

// The image paths that match the following patterns will use `PALETTE_APP_COLORS`,
// while all other paths with fall back to `PALETTE_ILLUSTRATION_COLORS`
const SVG_APP_PATHS = [
	// Color scheme thumbnails
	/color-scheme-thumbnail-[a-z-]+\.svg$/,

	// Component icons
	/^client\/components\/jetpack\/daily-backup-status\/status-card/,

	// Plan icons
	/^static\/images\/plans\//,
];

// The regular expressions used to identify color values
const SVG_VALUE_EXPRESSION =
	/(?:fill|flood-color|lighting-color|stop-color|stroke)="([a-z0-9#]*?)"/gi;
const SVG_STYLE_EXPRESSION =
	/(?:fill|flood-color|lighting-color|stop-color|stroke):\s*([a-z0-9#]*?)\s*[;}]/gi;

// The specific color values to ignore, including other variations of white
// primarily to decrease the amount of noise in the output
const SVG_IGNORE_VALUES = [ 'currentcolor', 'none', 'transparent', 'white', '#ffffff' ];

/**
 * Other constants
 */

const ROOT_PATH = path.join( __dirname, '..' );
const GIT_DIR_PATH = path.join( ROOT_PATH, '.git' );

const SVG_FILES_TO_PROCESS = execSync( `git --git-dir="${ GIT_DIR_PATH }" ls-files "*.svg"` )
	.toString()
	.trim()
	.split( /\s+/ )
	.filter( excludeSelectedPaths );

const REPLACEMENT_RULES = [];

/**
 * Perform the audit
 */

SVG_FILES_TO_PROCESS.forEach( ( imagePath ) => {
	const targetPreset = isAppImagePath( imagePath ) ? 'app' : 'illustration';
	const targetValues =
		targetPreset === 'app' ? PALETTE_APP_COLOR_VALUES : PALETTE_ILLUSTRATION_COLOR_VALUES;

	const imageContent = getFileContents( imagePath );
	const matchedColorValues = matchColorValues( imageContent );
	const colorValuesToReplace = [];

	[ ...new Set( matchedColorValues ) ].forEach( ( value ) => {
		if ( SVG_IGNORE_VALUES.includes( value ) ) {
			return;
		}

		if ( targetValues.includes( value ) ) {
			return;
		}

		if ( colorValuesToReplace.includes( value ) ) {
			return;
		}

		colorValuesToReplace.push( value );
	} );

	if ( ! colorValuesToReplace.length ) {
		return;
	}

	// There are SVG files where stroke value is 'null'.
	// Added the filter before map() to ensure 'null' strings are filtered out.
	REPLACEMENT_RULES.push( {
		file: imagePath,
		preset: targetPreset,
		rules: colorValuesToReplace
			.filter( ( val ) => val !== 'null' )
			.map( ( value ) => {
				const replacementValue = findClosestColor( value, targetValues );
				const replacementName = findPaletteColorName( replacementValue );

				return {
					from: {
						value,
					},
					to: {
						value: replacementValue,
						name: replacementName,
					},
				};
			} ),
	} );
} );

/**
 * Output
 */

printReplacementRules( REPLACEMENT_RULES );

/**
 * Utilities
 */

function excludeSelectedPaths( imagePath ) {
	// Make sure none of the ignored paths match
	return SVG_IGNORE_PATHS.every( ( ignoredPath ) => {
		return ! ignoredPath.test( imagePath );
	} );
}

function isAppImagePath( imagePath ) {
	return SVG_APP_PATHS.some( ( appPath ) => {
		return appPath.test( imagePath );
	} );
}

function getFileContents( filePath ) {
	return readFileSync( path.join( ROOT_PATH, filePath ) ).toString().trim();
}

function matchColorValues( content ) {
	const values = [];
	let match;

	[ SVG_VALUE_EXPRESSION, SVG_STYLE_EXPRESSION ].forEach( ( expression ) => {
		// `String.matchAll` is unsupported at the moment
		while ( ( match = expression.exec( content ) ) !== null ) {
			values.push( match[ 1 ].toLowerCase() );
		}
	} );

	return values;
}

function findClosestColor( value, targetValues ) {
	let closestValue = value;
	let closestDistance = Infinity;
	let targetValue;

	for ( targetValue of targetValues ) {
		const distance = chroma.distance( value, targetValue );

		// This bit shortens existing variations of white to `#fff`
		// for consitent notation that this script relies on
		if ( distance === 0 ) {
			closestValue = targetValue;
			closestDistance = distance;
			break;
		}

		// Unless white is explicitely used, let’s not convert darker colors to it
		if ( targetValue === '#fff' ) {
			continue;
		}

		if ( distance < closestDistance ) {
			closestValue = targetValue;
			closestDistance = distance;
		}
	}

	return closestValue;
}

function findPaletteColorName( value ) {
	// Iterating from right to make sure color name aliases aren’t caught
	const name = Object.keys( PALETTE.colors ?? {} ).findLast( ( paletteColorName ) => {
		return PALETTE.colors[ paletteColorName ] === value;
	} );
	return name;
}

function printReplacementRules( replacementObjects ) {
	const count = replacementObjects.length;

	if ( count <= 0 ) {
		console.log(
			`All the SVG illustration files in this repository seem to use correct color values. ✨`
		);
	} else {
		console.log(
			`Found ${ count } SVG images in this repository that use non-standard color values:`
		);

		replacementObjects.forEach( ( replacementObject ) => {
			const replacementRules = formatReplacementRules( replacementObject.rules );
			const replacementSuffix = getReplacementPrefixSuffix( replacementObject );
			console.log(
				`\n${ replacementObject.file }${ replacementSuffix }\n${ replacementRules.join( '\n' ) }`
			);
		} );
	}
}

function formatReplacementRules( rules ) {
	if ( rules && rules.length ) {
		return [ ...rules ].sort( compareByName ).map( ( rule ) => {
			const valueFrom = rule.from.value.padEnd( 7 );
			const valueTo = rule.to.value.padEnd( 7 );

			return `${ valueFrom } → ${ valueTo } (${ rule.to.name })`;
		} );
	}
	return [];
}

function getReplacementPrefixSuffix( replacementObject ) {
	const { preset } = replacementObject;
	return preset === 'app' ? ' 🖥' : '';
}
