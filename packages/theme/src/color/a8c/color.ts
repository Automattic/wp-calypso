/**
 * External dependencies
 */
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import namesPlugin from 'colord/plugins/names';
import { ColorBaseTokens, ColorScale, ThemeProps } from '../../types';

extend( [ namesPlugin, a11yPlugin ] );

const LIGHT_VALUES = [ 100, 98, 95, 92, 89, 87, 83, 73, 55, 48, 39, 13 ];
const DARK_VALUES = [ 1, 11, 16, 19, 22, 18, 29, 38, 43, 73, 80, 93 ];
export const PRIMARY_DEFAULT = '#3858e9';

const generateNeutralScale = ( { color = PRIMARY_DEFAULT, fun = 0, isDark = false } ) => {
	const base = colord( color ).toHsl();
	const lightValues = isDark ? DARK_VALUES : LIGHT_VALUES;
	return lightValues.map( ( value ) =>
		colord( { ...base, s: fun, l: value } ).toHex()
	) as ColorScale;
};

const generatePrimaryScale = ( {
	color = PRIMARY_DEFAULT,
	bg,
	isDark = false,
}: {
	color?: string;
	bg: string;
	isDark?: boolean;
} ) => {
	const base = colord( color ).toHsl();
	const lightValues = isDark ? DARK_VALUES : LIGHT_VALUES;

	// if the color given has enough contrast agains the background, use that as the solid background colour and adjust the surrounding scale to proportionally move with it
	const length = lightValues.length;
	// Calculate the difference between the new value and the old value
	const diff = base.l - lightValues[ 8 ];
	// Calculate the weight for adjusting values. Closer to base colour should adjust more.
	const weight = ( index: number ) => 1 - Math.abs( 8 - index ) / ( length - 1 );
	// Adjust all values in the array based on their weight
	let adjustedArray = [ ...lightValues ];
	if ( colord( bg ).isReadable( base ) ) {
		adjustedArray = lightValues.map( ( value, index ) => {
			const adjustment = diff * weight( index );
			return index === 8 ? base.l : value + adjustment;
		} );
	}

	// convert colours to hex and set min and max lightness values
	return adjustedArray.map( ( value ) =>
		colord( {
			...base,
			l: Math.min( Math.max( value, 0 ), 100 ),
		} ).toHex()
	) as ColorScale;
};

export const generateBaseTokens = ( colorProp: ThemeProps[ 'color' ] ) => {
	const color = colorProp.primary ?? PRIMARY_DEFAULT;
	const fun = colorProp.fun ?? 0;
	const isDark = colorProp.scheme === 'dark';

	const neutralScale = generateNeutralScale( { color, fun, isDark } );

	const primaryScale = generatePrimaryScale( {
		color,
		bg: neutralScale[ 2 ],
		isDark,
	} );

	return {
		[ 'neutral-scale' ]: neutralScale,
		[ 'primary-scale' ]: primaryScale,
	} as ColorBaseTokens;
};
