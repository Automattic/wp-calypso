#!/usr/bin/env node

/**
 * The script looks for all colors used in the SVG images found in the repository
 * and suggests Color Studio replacements for all non-standard values it finds.
 *
 * List all non-standard color values by image path:
 * $ node ./bin/audit-svg-colors.js
 *
 * List all non-standard color values in aggregate:
 * $ node ./bin/audit-svg-colors.js --list
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
 * Configurable constants
 */

const ROOT_PATH = path.join( __dirname, '..' );
const GIT_DIR_PATH = path.join( ROOT_PATH, '.git' );

const SVG_PATH_EXCLUSIONS = [
	// Common logos found in the repository
	/(?:google-photos|paypal|stripe)(-logo)?\.svg$/,

	// Selected logos from the G-Suite asset directory
	/images\/g-suite\/logo_/,

	// Credit card and payment gateway logos (the disabled versions are allowed)
	/upgrades\/cc-(?:amex|diners|discover|jcb|mastercard|unionpay|visa)\.svg$/,
	/upgrades\/(?:alipay|bancontact|brazil-tef|emergent-paywall|eps|giropay|ideal|net-banking|p24|paypal|paytm|sofort|tef|wechat)\.svg$/,

	// Old WooCommerce mascotte
	/ninja-joy\.svg$/,

	// Color scheme thumbnails which use all palette colors (not the subset defined below)
	/color-scheme-thumbnail-[a-z-]+\.svg$/,

	// Specific directories
	/^docs/,
	/^static\/images\/marketing/,
	/^static\/images\/me/,
];

const SVG_FILES_TO_PROCESS = execSync( `git --git-dir="${ GIT_DIR_PATH }" ls-files "*.svg"` )
	.toString()
	.trim()
	.split( /\s+/ )
	.filter( excludeSelectedPaths );

const SVG_COLOR_VALUE_EXPRESSION = /(?:fill|flood-color|lighting-color|stop-color|stroke)="([a-z0-9#]*?)"/gi;
const SVG_COLOR_VALUE_EXCLUSIONS = [ 'currentcolor', 'none', 'transparent' ];

const SELECTED_PALETTE_COLORS = _.pickBy( PALETTE.colors, ( colorValue, colorName ) => {
	// Avoid using pure black in illustrations
	if ( colorValue === '#000' ) {
		return false;
	}

	// Exclude WooCommerce Purple from illustration use
	if ( _.startsWith( colorName, 'WooCommerce Purple' ) ) {
		return false;
	}

	// Prefer WordPress Blue and Jetpack Green over Blue and Green in SVG files
	// as the illustrations are a part of their visual identity
	if ( _.startsWith( colorName, 'Blue' ) || _.startsWith( colorName, 'Green' ) ) {
		return false;
	}

	return true;
} );

const SELECTED_PALETTE_COLOR_VALUES = _.uniq( Object.values( SELECTED_PALETTE_COLORS ) );

const AGGREGATE_LIST_MODE = process.argv.includes( '--list' );

/**
 * Find all color values available in the selected SVG files
 */

const COLOR_VALUES_FOUND = [];
const COLOR_VALUES_TO_REPLACE = [];

SVG_FILES_TO_PROCESS.forEach( imagePath => {
	const imageContent = getFileContents( imagePath );
	const colorValues = findColorValuesIn( imageContent );
	const colorValuesToReplace = [];

	_.uniq( colorValues ).forEach( value => {
		if ( SVG_COLOR_VALUE_EXCLUSIONS.includes( value ) ) {
			return;
		}

		if ( SELECTED_PALETTE_COLOR_VALUES.includes( value ) ) {
			return;
		}

		if ( colorValuesToReplace.includes( value ) ) {
			return;
		}

		colorValuesToReplace.push( value );
	} );

	if ( colorValuesToReplace.length > 0 ) {
		COLOR_VALUES_FOUND.push( {
			file: imagePath,
			values: colorValuesToReplace,
		} );
	}
} );

COLOR_VALUES_FOUND.forEach( valueObject => {
	const repacementObject = {
		file: valueObject.file,
		rules: valueObject.values.map( value => {
			const replacementValue = findClosestPaletteColor( value );
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
	};

	COLOR_VALUES_TO_REPLACE.push( repacementObject );
} );

/**
 * Output
 */

if ( AGGREGATE_LIST_MODE ) {
	printReplacementRulesInAggregate( COLOR_VALUES_TO_REPLACE );
} else {
	printReplacementRulesByImage( COLOR_VALUES_TO_REPLACE );
}

/**
 * Utilities
 */

function excludeSelectedPaths( imagePath ) {
	// Make sure none of the paths match
	return SVG_PATH_EXCLUSIONS.every( exclusion => {
		return ! exclusion.test( imagePath );
	} );
}

function getFileContents( filePath ) {
	return readFileSync( path.join( ROOT_PATH, filePath ) )
		.toString()
		.trim();
}

function findColorValuesIn( content ) {
	const values = [];
	let match;

	// `String.matchAll` is unsupported at the moment
	while ( ( match = SVG_COLOR_VALUE_EXPRESSION.exec( content ) ) !== null ) {
		values.push( match[ 1 ].toLowerCase() );
	}

	return values;
}

function findClosestPaletteColor( value ) {
	let closestValue = value;
	let closestDistance = Infinity;
	let paletteValue;

	for ( paletteValue of SELECTED_PALETTE_COLOR_VALUES ) {
		const distance = chroma.distance( value, paletteValue );

		// This bit shortens existing variations of white to `#fff`
		if ( distance === 0 ) {
			closestValue = paletteValue;
			closestDistance = distance;
			break;
		}

		// Unless white is explicitely used, let’s not convert darker colors to it
		if ( paletteValue === '#fff' ) {
			continue;
		}

		if ( distance < closestDistance ) {
			closestValue = paletteValue;
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

function printReplacementRulesByImage( replacementObjects ) {
	const count = replacementObjects.length;

	if ( count <= 0 ) {
		console.log( `All SVG illustrations seem to use correct color values. ✨` );
	} else {
		console.log(
			`Found ${ count } SVG images in this repository that use non-standard color values:`
		);

		replacementObjects.forEach( replacementObject => {
			const replacementRules = formatReplacementRules( replacementObject.rules );
			console.log( `\n${ replacementObject.file }\n${ replacementRules.join( '\n' ) }` );
		} );
	}
}

function printReplacementRulesInAggregate( replacementObjects ) {
	const rules = getUniqueReplacementRules( replacementObjects );
	const count = rules.length;

	if ( count <= 0 ) {
		console.log( `All SVG illustrations seem to use correct color values. ✨` );
	} else {
		console.log(
			`Found ${ count } non-standard color values used in the SVG images in this repository:`
		);

		const replacementRules = formatReplacementRules( rules );
		console.log( `\n${ replacementRules.join( '\n' ) }` );
	}
}

function formatReplacementRules( rules ) {
	return _.sortBy( rules, 'to.name' ).map( rule => {
		const valueFrom = _.padEnd( rule.from.value, 7 );
		const valueTo = _.padEnd( rule.to.value, 7 );

		return `${ valueFrom } → ${ valueTo } (${ rule.to.name })`;
	} );
}

function getUniqueReplacementRules( replacementObjects ) {
	const colorValues = [];
	const colorRules = [];

	replacementObjects.forEach( replacementObject => {
		replacementObject.rules.forEach( rule => {
			const value = rule.from.value;

			if ( colorValues.includes( value ) ) {
				return;
			}

			colorValues.push( value );
			colorRules.push( rule );
		} );
	} );

	return colorRules;
}
