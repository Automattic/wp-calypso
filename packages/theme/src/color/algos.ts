import * as RadixColors from '@radix-ui/colors';
import BezierEasing from 'bezier-easing';
import Color from 'colorjs.io';
import { ArrayOf12 } from './types';

const arrayOf12 = [ 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11 ] as const;

// prettier-ignore
const grayScaleNames = ['gray', 'mauve', 'slate', 'sage', 'olive', 'sand'] as const;

// prettier-ignore
const scaleNames = [...grayScaleNames, 'tomato', 'red', 'ruby', 'crimson', 'pink',
'plum', 'purple', 'violet', 'iris', 'indigo', 'blue', 'cyan', 'teal', 'jade', 'green',
'grass', 'brown', 'orange', 'sky', 'mint', 'lime', 'yellow', 'amber'] as const;

const darkModeEasing = [ 1, 0, 1, 0 ] as [ number, number, number, number ];
const lightModeEasing = [ 0, 2, 0, 2 ] as [ number, number, number, number ];

const lightColors = Object.fromEntries(
	scaleNames.map( ( scaleName ) => [
		scaleName,
		Object.values( RadixColors[ `${ scaleName }P3` ] ).map( ( str ) =>
			new Color( str ).to( 'oklch' )
		),
	] )
) as Record< ( typeof scaleNames )[ number ], ArrayOf12< Color > >;

const darkColors = Object.fromEntries(
	scaleNames.map( ( scaleName ) => [
		scaleName,
		Object.values( RadixColors[ `${ scaleName }DarkP3` ] ).map( ( str ) =>
			new Color( str ).to( 'oklch' )
		),
	] )
) as Record< ( typeof scaleNames )[ number ], ArrayOf12< Color > >;

const lightGrayColors = Object.fromEntries(
	grayScaleNames.map( ( scaleName ) => [
		scaleName,
		Object.values( RadixColors[ `${ scaleName }P3` ] ).map( ( str ) =>
			new Color( str ).to( 'oklch' )
		),
	] )
) as Record< ( typeof grayScaleNames )[ number ], ArrayOf12< Color > >;

const darkGrayColors = Object.fromEntries(
	grayScaleNames.map( ( scaleName ) => [
		scaleName,
		Object.values( RadixColors[ `${ scaleName }DarkP3` ] ).map( ( str ) =>
			new Color( str ).to( 'oklch' )
		),
	] )
) as Record< ( typeof grayScaleNames )[ number ], ArrayOf12< Color > >;

// TODO: confirm the reference BG colors are correct
function getReferenceBackgroundColor( appearance: 'light' | 'dark' ) {
	return appearance === 'light'
		? new Color( '#fff' ).to( 'oklch' )
		: new Color( '#000' ).to( 'oklch' );
}

export const generateColorScales = ( {
	appearance,
	accent,
	gray,
}: {
	appearance: 'light' | 'dark';
	accent: string;
	gray: string;
} ) => {
	const allScales = appearance === 'light' ? lightColors : darkColors;
	const grayScales = appearance === 'light' ? lightGrayColors : darkGrayColors;
	const backgroundColor = getReferenceBackgroundColor( appearance );

	const grayBaseColor = new Color( gray ).to( 'oklch' );
	const grayScaleColors = getScaleFromColor( grayBaseColor, grayScales, backgroundColor );

	const accentBaseColor = new Color( accent ).to( 'oklch' );

	let accentScaleColors = getScaleFromColor( accentBaseColor, allScales, backgroundColor );

	// Enforce srgb for the background color
	const backgroundHex = backgroundColor.to( 'srgb' ).toString( { format: 'hex' } );

	// Make sure we use the tint from the gray scale for when base is pure white or black
	const accentBaseHex = accentBaseColor.to( 'srgb' ).toString( { format: 'hex' } );
	if ( accentBaseHex === '#000' || accentBaseHex === '#fff' ) {
		accentScaleColors = grayScaleColors.map( ( color ) => color.clone() ) as ArrayOf12< Color >;
	}

	const [ accent9Color, accentContrastColorSmallText, accentContrastColorLargeText ] =
		getStep9Colors( accentScaleColors, accentBaseColor );

	accentScaleColors[ 8 ] = accent9Color;
	accentScaleColors[ 9 ] = getButtonHoverColor( accent9Color, [ accentScaleColors ] );

	// Limit saturation of the text colors
	accentScaleColors[ 10 ].coords[ 1 ] = Math.min(
		Math.max( accentScaleColors[ 8 ].coords[ 1 ], accentScaleColors[ 7 ].coords[ 1 ] ),
		accentScaleColors[ 10 ].coords[ 1 ]
	);
	accentScaleColors[ 11 ].coords[ 1 ] = Math.min(
		Math.max( accentScaleColors[ 8 ].coords[ 1 ], accentScaleColors[ 7 ].coords[ 1 ] ),
		accentScaleColors[ 11 ].coords[ 1 ]
	);

	const accentScaleHex = accentScaleColors.map( ( color ) =>
		color.to( 'srgb' ).toString( { format: 'hex' } )
	) as ArrayOf12< string >;

	const accentContrastColorSmallTextHex = accentContrastColorSmallText
		.to( 'srgb' )
		.toString( { format: 'hex' } );
	const accentContrastColorLargeTextHex = accentContrastColorLargeText
		.to( 'srgb' )
		.toString( { format: 'hex' } );

	const grayScaleHex = grayScaleColors.map( ( color ) =>
		color.to( 'srgb' ).toString( { format: 'hex' } )
	) as ArrayOf12< string >;

	return {
		// Accent
		accentScale: accentScaleHex,
		accentContrastSmallText: accentContrastColorSmallTextHex,
		accentContrastLargeText: accentContrastColorLargeTextHex,
		// Gray
		grayScale: grayScaleHex,
		// Background
		background: backgroundHex,
	};
};

function getStep9Colors(
	scale: ArrayOf12< Color >,
	accentBaseColor: Color
): [ Color, Color, Color ] {
	const referenceBackgroundColor = scale[ 0 ];
	const distance = accentBaseColor.deltaEOK( referenceBackgroundColor ) * 100;

	// If the accent base color is close to the page background color, it's likely
	// white on white or black on black, so we want to return something that makes sense instead
	if ( distance < 25 ) {
		return [ scale[ 8 ], getTextColor( scale[ 8 ], false ), getTextColor( scale[ 8 ], true ) ];
	}

	return [
		accentBaseColor,
		getTextColor( accentBaseColor, false ),
		getTextColor( accentBaseColor, true ),
	];
}

function getButtonHoverColor( source: Color, scales: ArrayOf12< Color >[] ) {
	const [ L, C, H ] = source.coords;
	const newL = L > 0.4 ? L - 0.03 / ( L + 0.1 ) : L + 0.03 / ( L + 0.1 );
	const newC = L > 0.4 && ! isNaN( H ) ? C * 0.93 + 0 : C;
	const buttonHoverColor = new Color( 'oklch', [ newL, newC, H ] );

	// Find closest in-scale color to donate the chroma and hue.
	// Especially useful when the source color is pure white or black,
	// but the gray scale is tinted.
	let closestColor = buttonHoverColor;
	let minDistance = Infinity;

	scales.forEach( ( scale ) => {
		for ( const color of scale ) {
			const distance = buttonHoverColor.deltaEOK( color );
			if ( distance < minDistance ) {
				minDistance = distance;
				closestColor = color;
			}
		}
	} );

	buttonHoverColor.coords[ 1 ] = closestColor.coords[ 1 ];
	buttonHoverColor.coords[ 2 ] = closestColor.coords[ 2 ];
	return buttonHoverColor;
}

function getScaleFromColor(
	source: Color,
	scales: Record< string, ArrayOf12< Color > >,
	backgroundColor: Color
) {
	const allColors: { scale: string; color: Color; distance: number }[] = [];

	Object.entries( scales ).forEach( ( [ name, scale ] ) => {
		for ( const color of scale ) {
			const distance = source.deltaEOK( color );
			allColors.push( { scale: name, distance, color } );
		}
	} );

	allColors.sort( ( a, b ) => a.distance - b.distance );

	// Remove non-unique scales
	const closestColors = allColors.filter(
		( color, i, arr ) => i === arr.findIndex( ( value ) => value.scale === color.scale )
	);

	// If the next two closest colors are both grays, remove the second one until it’s not a gray anymore.
	// This is because up next we will be comparing how close the two closest colors are to the source color,
	// and since the grays are all extremely close to each other, we won’t get any useful data from the second
	// closest color if it’s also a gray.
	const grayScaleNamesStr = grayScaleNames as readonly string[];
	const allAreGrays = closestColors.every( ( color ) => grayScaleNamesStr.includes( color.scale ) );
	if ( ! allAreGrays && grayScaleNamesStr.includes( closestColors[ 0 ].scale ) ) {
		while ( grayScaleNamesStr.includes( closestColors[ 1 ].scale ) ) {
			closestColors.splice( 1, 1 );
		}
	}

	const colorA = closestColors[ 0 ];
	const colorB = closestColors[ 1 ];

	// Light trigonometry ahead.
	//
	// We want to determine the color that is the closest to the source color. Sometimes it makes sense
	// to proportionally mix the two closest colors together, but sometimes it is not useful at all.
	// Color coords are spatial in 3D, however we can treat the data we have as a 2D projection that is good enough.
	//
	// Case 1:
	// If the distances between the source color, the 1st closest color (A) and the 2nd closest color (B) form
	// a triangle where NEITHER angle A nor B are larger than 90 degrees, then we want to mix the 1st and the 2nd
	// closest colors in the same proportion as distances AD and BD are to each other. Mixing the two would result
	// in a color that would be closer to the source color than either of the two original closest colors.
	// Example: source color is a desaturated blue, which is between "indigo" and "slate" scales.
	//
	//        C ← Source color
	//       /|⟍
	//      / |  ⟍
	//   b /  |    ⟍  a
	//    /   |      ⟍
	//   /    |        ⟍
	//  A --- D -------- B
	//        ↑
	//        The color we want to use as the base, which is a mix of A and B.
	//
	// Case 2:
	// If the distances between the source color, the 1st closest color (A) and the 2nd closest color (B) form
	// a triangle where EITHER angle A or B are larger than 90 degrees, then we don’t care about point B because it’s
	// directionally the same as A, as mixing A and B can’t provide us with a color that is any closer to the source.
	// Example: source color is a saturated blue, with "blue" being the closest scale, and "indigo" just being further.
	//
	//      C ← Source color
	//       \⟍
	//        \  ⟍
	//         \    ⟍  a
	//        b \      ⟍
	//           \        ⟍
	//            A ------- B
	//            ↑
	//            The color we want to use as the base, which is not influenced by B.

	// We’ll need all the lengths of the triangle sides, named after the angles they look at:
	const a = colorB.distance;
	const b = colorA.distance;
	const c = colorA.color.deltaEOK( colorB.color );

	// We can get the ratios of AD to BD lengths with trigonometry using tangents,
	// as the ratio of the tangents of the opposite angles will match.
	const cosA = ( b ** 2 + c ** 2 - a ** 2 ) / ( 2 * b * c );
	const radA = Math.acos( cosA );
	const sinA = Math.sin( radA );

	const cosB = ( a ** 2 + c ** 2 - b ** 2 ) / ( 2 * a * c );
	const radB = Math.acos( cosB );
	const sinB = Math.sin( radB );

	// Tangent of angle C in the ACD triangle
	const tanC1 = cosA / sinA;

	// Tangent of angle C in the BCD triangle
	const tanC2 = cosB / sinB;

	// The ratio of the tangents corresponds to the ratio of the distances AD to BD
	// In the end, it means how much of scale B we want to mix into scale A.
	// If it’s "0" or less, this is an obtuse triangle from case 2, and we use just scale A.
	const ratio = Math.max( 0, tanC1 / tanC2 ) * 0.5;

	// The base scale is going to be a mix of the two closest scales, with the mix ratio we determined before
	const scaleA = scales[ colorA.scale ];
	const scaleB = scales[ colorB.scale ];
	const scale = arrayOf12.map( ( i ) =>
		new Color( Color.mix( scaleA[ i ], scaleB[ i ], ratio ) ).to( 'oklch' )
	) as ArrayOf12< Color >;

	// Get the closest color from the pre-mixed scale we created
	const baseColor = scale
		.slice()
		.sort( ( a, b ) => source.deltaEOK( a ) - source.deltaEOK( b ) )[ 0 ];

	// Note the chroma difference between the source color and the base color
	const ratioC = source.coords[ 1 ] / baseColor.coords[ 1 ];

	// Modify hue and chroma of the scale to match the source color
	scale.forEach( ( color ) => {
		color.coords[ 1 ] = Math.min( source.coords[ 1 ] * 1.5, color.coords[ 1 ] * ratioC );
		color.coords[ 2 ] = source.coords[ 2 ];
	} );

	// Light mode
	if ( scale[ 0 ].coords[ 0 ] > 0.5 ) {
		const lightnessScale = scale.map( ( { coords } ) => coords[ 0 ] );
		const backgroundL = Math.max( 0, Math.min( 1, backgroundColor.coords[ 0 ] ) );
		const newLightnessScale = transposeProgressionStart(
			backgroundL,
			// Add white as the first "step" of the light scale
			[ 1, ...lightnessScale ],
			lightModeEasing
		);

		// Remove the step we added
		newLightnessScale.shift();

		newLightnessScale.forEach( ( lightness, i ) => {
			scale[ i ].coords[ 0 ] = lightness;
		} );

		return scale;
	}

	// Dark mode
	const ease: typeof darkModeEasing = [ ...darkModeEasing ];
	const referenceBackgroundColorL = scale[ 0 ].coords[ 0 ];
	const backgroundColorL = Math.max( 0, Math.min( 1, backgroundColor.coords[ 0 ] ) );

	// If background is lighter than step 0, we want to gradually change the easing to linear
	const ratioL = backgroundColorL / referenceBackgroundColorL;

	if ( ratioL > 1 ) {
		const maxRatio = 1.5;

		for ( let i = 0; i < ease.length; i++ ) {
			const metaRatio = ( ratioL - 1 ) * ( maxRatio / ( maxRatio - 1 ) );
			ease[ i ] = ratioL > maxRatio ? 0 : Math.max( 0, ease[ i ] * ( 1 - metaRatio ) );
		}
	}

	const lightnessScale = scale.map( ( { coords } ) => coords[ 0 ] );
	const backgroundL = backgroundColor.coords[ 0 ];
	const newLightnessScale = transposeProgressionStart( backgroundL, lightnessScale, ease );

	newLightnessScale.forEach( ( lightness, i ) => {
		scale[ i ].coords[ 0 ] = lightness;
	} );

	return scale;
}

// TODO: the way contrast text is calculated has room for interpretation.
// - if both white and black meet the contrast, we still pick the one with the
//   higher contrast. We could instead be more opinionated (ie. pick white for
//   light appearance and black for dark appearance, pick always white, ...);
// - fixed black/white vs trying the earliest shade of gray that meets contrast;
// - use chroma/hue from the background or the accent to the shade of gray;
// - small vs large text;
// - consider a different algo (APAC? although check for WCAG requirements);
// - high contrast mode (ie. change thresholds)
function getTextColor( background: Color, isLargeText = true ) {
	const targetContrast = isLargeText ? 3 : 4.5;

	const white = new Color( 'oklch', [ 1, 0, 0 ] );
	const black = new Color( 'oklch', [ 0, 0, 0 ] );

	const contrastWithBlack = background.contrastWCAG21( black );
	const contrastWithWhite = background.contrastWCAG21( white );

	// Check if either black or white meets the target contrast
	if ( contrastWithBlack >= targetContrast && contrastWithWhite >= targetContrast ) {
		// Both colors meet the contrast requirement; choose the one with higher contrast
		return contrastWithBlack > contrastWithWhite ? black : white;
	} else if ( contrastWithBlack >= targetContrast ) {
		return black;
	} else if ( contrastWithWhite >= targetContrast ) {
		return white;
	}
	// Neither black nor white meets the contrast requirement
	// Attempt to find a color that does
	// For simplicity, return the one with higher contrast
	return contrastWithBlack > contrastWithWhite ? black : white;
}

export function transposeProgressionStart(
	to: number,
	arr: number[],
	curve: [ number, number, number, number ]
) {
	return arr.map( ( n, i, arr ) => {
		const lastIndex = arr.length - 1;
		const diff = arr[ 0 ] - to;
		const fn = BezierEasing( ...curve );
		return n - diff * fn( 1 - i / lastIndex );
	} );
}

export function transposeProgressionEnd(
	to: number,
	arr: number[],
	curve: [ number, number, number, number ]
) {
	return arr.map( ( n, i, arr ) => {
		const lastIndex = arr.length - 1;
		const diff = arr[ lastIndex ] - to;
		const fn = BezierEasing( ...curve );
		return n - diff * fn( i / lastIndex );
	} );
}
