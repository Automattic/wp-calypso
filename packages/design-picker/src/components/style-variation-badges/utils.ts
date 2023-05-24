import { hexToRgb } from '@automattic/onboarding';
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

function getColors( variation: StyleVariation ) {
	return variation.settings?.color?.palette?.theme || [];
}

function getColorBaseFromColors( colors: StyleVariationSettingsColorPalette[] ) {
	const background = colors.find( ( item ) => item.slug === 'background' );
	const base = colors.find( ( item ) => item.slug === 'base' );
	return base?.color || background?.color || '#ffffff';
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

function findColorLeastAnalogous( hexCodes: string[], baseHex: string ) {
	const baseHsl = hexToHsl( baseHex );
	const analogous = getColorAnalogous( baseHsl );

	let maxHslDifference = -Infinity;
	let leastAnalogous = '';
	for ( const hex of hexCodes ) {
		const hsl = hexToHsl( hex );
		const hslDifference = Math.max(
			getHslDifference( analogous[ 0 ], hsl ),
			getHslDifference( analogous[ 1 ], hsl )
		);

		if ( hslDifference > maxHslDifference ) {
			maxHslDifference = hslDifference;
			leastAnalogous = hex;
		}
	}

	return leastAnalogous;
}

export function getStylesColorFromVariation(
	variation: StyleVariation
): StyleVariationStylesColor {
	const palette = getColors( variation );
	const colorBase = getColorBaseFromColors( palette );
	const colorList = palette.map( ( item ) => item.color );
	const foregroundColor = findColorLeastAnalogous( colorList, colorBase );

	return {
		background: colorBase,
		text: foregroundColor,
	};
}
