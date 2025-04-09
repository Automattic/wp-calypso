/**
 * External dependencies
 */
import { colord, extend } from 'colord';
import a11yPlugin from 'colord/plugins/a11y';
import namesPlugin from 'colord/plugins/names';

extend( [ namesPlugin, a11yPlugin ] );

const LIGHT_VALUES = [ 100, 98, 95, 92, 89, 87, 83, 73, 55, 48, 39, 13 ];
const DARK_VALUES = [ 1, 11, 16, 19, 22, 18, 29, 38, 43, 73, 80, 93 ];
export const PRIMARY_DEFAULT = '#3858e9';

// map showing which lightness in scale each use case should use
// type ColorPalette< T > = Partial<
// 	Record<
// 		'bg' | 'text' | 'border',
// 		Partial<
// 			Record<
// 				'default' | 'hover' | 'active' | 'input' | 'muted' | 'strong' | 'inverse' | 'disabled',
// 				T | Partial< Record< 'default' | 'disabled' | 'hover' | 'strong', T > >
// 			>
// 		>
// 	>
// >;

type ColorPalette< T > = {
	[ key: string ]: T | ColorPalette< T >;
};

const COLOR_MAP: ColorPalette< number > = {
	bg: {
		default: 2,
		hover: 3,
		active: 4,
		input: {
			default: 0,
			disabled: 0,
		},
		muted: 1,
		strong: {
			default: 8,
			hover: 9,
		},
	},
	text: {
		default: 10,
		hover: 11,
		strong: 11,
		inverse: {
			default: 1,
			strong: 0,
		},
		muted: 9,
	},
	border: {
		default: 5,
		disabled: 4,
		input: 6,
		strong: {
			default: 6,
			hover: 7,
		},
		muted: 4,
		hover: 6,
	},
};

// maps a color map to a color palette

const mapColors = ( mapFromArray: string[], mapToObject: ColorPalette< number > ) => {
	const map: ColorPalette< string > = {};
	Object.entries( mapToObject ).forEach( ( [ alias, color ] ) => {
		map[ alias ] =
			typeof color === 'object' ? mapColors( mapFromArray, color ) : mapFromArray[ color ];
	} );
	return map;
};

const generateNeutralScale = ( { color = PRIMARY_DEFAULT, fun = 0, isDark = false } ) => {
	const base = colord( color ).toHsl();
	const lightValues = isDark ? DARK_VALUES : LIGHT_VALUES;
	return lightValues.map( ( value ) => colord( { ...base, s: fun, l: value } ).toHex() );
};

const generateNeutralColors = ( { color = PRIMARY_DEFAULT, fun = 0, isDark = false } ) => {
	return mapColors( generateNeutralScale( { color, fun, isDark } ), COLOR_MAP );
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
	);
};

const generatePrimaryColors = ( {
	color = PRIMARY_DEFAULT,
	bg,
	isDark = false,
}: {
	color?: string;
	bg: string;
	isDark?: boolean;
} ) => {
	return mapColors( generatePrimaryScale( { color, bg, isDark } ), COLOR_MAP );
};

// const generatePrimaryColors = ( { color = PRIMARY_DEFAULT, bg, isDark = false } ) => {

// generates a color palette based on a primary color
export const generateColors = ( { color = PRIMARY_DEFAULT, fun = 0, isDark = false } ) => {
	const neutralScale = generateNeutralScale( { color, fun, isDark } );
	const neutral = generateNeutralColors( { color, fun, isDark } );

	const primaryScale = generatePrimaryScale( {
		color,
		// @ts-expect-error With the current `ColorPalette` type,
		// there's no way to guardantee that `bg` is an object
		bg: neutral.bg.default,
		isDark,
	} );
	const primary = generatePrimaryColors( {
		color,
		// @ts-expect-error With the current `ColorPalette` type,
		// there's no way to guardantee that `bg` is an object
		bg: neutral.bg.default,
		isDark,
	} );

	return {
		primary,
		neutral,
		[ 'neutral-scale' ]: neutralScale,
		[ 'primary-scale' ]: primaryScale,
	};
};
