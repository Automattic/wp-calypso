import { hexToRgb } from '@automattic/onboarding';
import debugFactory from 'debug';
import type {
	StyleVariation,
	StyleVariationSettingsColorPalette,
	StyleVariationStylesColor,
} from '../../types';

interface Hsl {
	h: number;
	s: number;
	l: number;
}

const debug = debugFactory( 'design-picker:style-variation-badges' );

const COLOR_BASE_CANDIDATE_KEYS = [ 'base', 'background', 'primary' ];
const HSL_BEST_DIFFERENCE_VALUE = 155;

function getColors( variation: StyleVariation ) {
	return variation.settings?.color?.palette?.theme || [];
}

function getColorBaseFromColors( colors: StyleVariationSettingsColorPalette[] ) {
	const colorMap: Record< string, string > = colors.reduce(
		( map, { color, slug } ) => ( { ...map, [ slug ]: color } ),
		{}
	);

	const baseColorKey = COLOR_BASE_CANDIDATE_KEYS.find( ( key ) => colorMap[ key ] ) ?? '';
	return colorMap[ baseColorKey ] || '#ffffff';
}

// See: https://en.wikipedia.org/wiki/HSL_and_HSV#From_RGB
function hexToHsl( hexCode: string ) {
	const { r, g, b } = hexToRgb( hexCode );
	const max = Math.max( r, g, b );
	const min = Math.min( r, g, b );
	const l = ( max + min ) / 2;
	let h = 0;
	let s = 0;

	if ( max !== min ) {
		const c = max - min;
		s = l > 0.5 ? c / ( 2 - max - min ) : c / ( max + min );

		switch ( max ) {
			case r:
				h = ( g - b ) / c + ( g < b ? 6 : 0 );
				break;

			case g:
				h = ( b - r ) / c + 2;
				break;

			case b:
				h = ( r - g ) / c + 4;
				break;

				h /= 6;
		}
	}

	return { h, s, l };
}

function getColorAnalogous( { h, s, l }: Hsl ) {
	const hA = ( h + 1 / 12 ) % 1;
	const hB = ( h - 1 / 12 + 1 ) % 1;
	return [
		{ h: hA, s, l },
		{ h: hB, s, l },
	];
}

function getHslDifference( hslA: Hsl, hslB: Hsl ) {
	const { h: hA, s: sA, l: lA } = hslA;
	const { h: hB, s: sB, l: lB } = hslB;
	return Math.abs( hA - hB ) + Math.abs( sA - sB ) + Math.abs( lA - lB );
}

function getHslBestDifference( value: number ) {
	return Math.abs( value - HSL_BEST_DIFFERENCE_VALUE );
}

function findColorBestAnalogous( hexCodes: string[], baseHex: string ) {
	const baseHsl = hexToHsl( baseHex );
	const analogous = getColorAnalogous( baseHsl );

	let bestHslDifference = -Infinity;
	let bestAnalogous = '';
	for ( const hex of hexCodes ) {
		let hsl;

		// We can't convert the hex to hsl if the value is something like `color-mix(in srgb, currentColor 20%, transparent)`
		try {
			hsl = hexToHsl( hex );
		} catch ( e ) {
			debug( e );
			continue;
		}

		const hslDifference = Math.max(
			getHslDifference( analogous[ 0 ], hsl ),
			getHslDifference( analogous[ 1 ], hsl )
		);

		if ( getHslBestDifference( hslDifference ) < getHslBestDifference( bestHslDifference ) ) {
			bestHslDifference = hslDifference;
			bestAnalogous = hex;
		}
	}

	return bestAnalogous;
}

export function getStylesColorFromVariation(
	variation: StyleVariation
): StyleVariationStylesColor | null {
	const palette = getColors( variation );
	const colorBase = getColorBaseFromColors( palette );
	const colorList = palette.map( ( item ) => item.color );

	try {
		return { background: colorBase, text: findColorBestAnalogous( colorList, colorBase ) };
	} catch ( e ) {
		debug( e, variation );
		return null;
	}
}
