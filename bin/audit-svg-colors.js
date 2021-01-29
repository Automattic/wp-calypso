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

/**
 * External dependencies
 */

const { execSync } = require( 'child_process' );
const path = require( 'path' );
const { readFileSync } = require( 'fs' );

const _ = require( 'lodash' );
const chroma = require( 'chroma-js' );
const PALETTE = require( '@automattic/color-studio' );

/**
 * Palette color subsets
 */

// The subset of palette colors allowed in illustrations
const PALETTE_ILLUSTRATION_COLORS = _.pickBy( PALETTE.colors, ( colorValue, colorName ) => {
	// Avoid using pure black
	if ( colorValue === '#000' ) {
		return;
	}
	// Avoid specific colors for illustration use
	return ! _.startsWith( colorName, 'Simplenote Blue' );
} );

// The subset of palette colors used in app-related images is slightly wider
// than what we allow for in illustration use (the above)
const PALETTE_APP_COLORS = _.pickBy( PALETTE.colors, ( colorValue, colorName ) => {
	// Avoid using pure black
	if ( colorValue === '#000' ) {
		return;
	}
	// Don’t use brand colors for any WordPress.com app images
	return ! (
		_.startsWith( colorName, 'Simplenote Blue' ) ||
		_.startsWith( colorName, 'WooCommerce Purple' ) ||
		_.startsWith( colorName, 'WordPress Blue' )
	);
} );

// Making sure both sets contain only unique color values
// (the palette defines aliases for some colors)
const PALETTE_ILLUSTRATION_COLOR_VALUES = _.uniq( Object.values( PALETTE_ILLUSTRATION_COLORS ) );
const PALETTE_APP_COLOR_VALUES = _.uniq( Object.values( PALETTE_APP_COLORS ) );

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
	/images\/customer-home\/illustration--task-podcasting.svg/,
	/images\/customer-home\/illustration--task-connect-social-accounts.svg/,

	// Credit card and payment gateway logos (the disabled versions are allowed)
	/upgrades\/cc-(?:amex|diners|discover|jcb|mastercard|unionpay|visa)\.svg$/,
	/upgrades\/(?:alipay|bancontact|brazil-tef|emergent-paywall|eps|giropay|ideal|netbanking|ovo|p24|paypal|paytm|sofort|tef|wechat)/,

	// Color scheme thumbnails that rely on .org colors
	/color-scheme-thumbnail-(?:blue|classic-dark|coffee|ectoplasm|light|modern|ocean|sunrise)\.svg$/,

	// Old WooCommerce mascotte
	/ninja-joy\.svg$/,

	// Specific images directories
	/^apps\/editing-toolkit\/editing-toolkit-plugin/,
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
const SVG_VALUE_EXPRESSION = /(?:fill|flood-color|lighting-color|stop-color|stroke)="([a-z0-9#]*?)"/gi;
const SVG_STYLE_EXPRESSION = /(?:fill|flood-color|lighting-color|stop-color|stroke):\s*([a-z0-9#]*?)\s*[;}]/gi;

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

	_.uniq( matchedColorValues ).forEach( ( value ) => {
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

	REPLACEMENT_RULES.push( {
		file: imagePath,
		preset: targetPreset,
		rules: colorValuesToReplace.map( ( value ) => {
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
	let name;

	// Iterating from right to make sure color name aliases aren’t caught
	_.forInRight( PALETTE.colors, ( paletteValue, paletteColorName ) => {
		if ( paletteValue === value ) {
			name = paletteColorName;
			return false;
		}
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
	return _.sortBy( rules, 'to.name' ).map( ( rule ) => {
		const valueFrom = _.padEnd( rule.from.value, 7 );
		const valueTo = _.padEnd( rule.to.value, 7 );

		return `${ valueFrom } → ${ valueTo } (${ rule.to.name })`;
	} );
}

function getReplacementPrefixSuffix( replacementObject ) {
	const { preset } = replacementObject;
	return preset === 'app' ? ' 🖥' : '';
}
