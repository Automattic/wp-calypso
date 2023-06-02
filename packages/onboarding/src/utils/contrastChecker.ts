export type RGB = {
	r: number;
	g: number;
	b: number;
};

// Default background color of Lettre theme
const LETTRE_THEME_SITE_BACKGROUND_COLOR_RGB = { r: 255, g: 255, b: 255 };
// Minimum contrast ratio as per WCAG standards "at least 4.5:1 for normal text"
const MIN_CONTRAST_RATIO = 1 / 4.5;

const luminance = ( { r, g, b }: RGB ) => {
	const a = [ r, g, b ].map( function ( v ) {
		v /= 255;
		return v <= 0.03928 ? v / 12.92 : Math.pow( ( v + 0.055 ) / 1.055, 2.4 );
	} );
	return a[ 0 ] * 0.2126 + a[ 1 ] * 0.7152 + a[ 2 ] * 0.0722;
};

const colorContrastRatio = ( color1luminance: number, color2luminance: number ) =>
	color1luminance > color2luminance
		? ( color2luminance + 0.05 ) / ( color1luminance + 0.05 )
		: ( color1luminance + 0.05 ) / ( color2luminance + 0.05 );

export const hasMinContrast = (
	textColorRgb: RGB,
	bgColorRgb = LETTRE_THEME_SITE_BACKGROUND_COLOR_RGB,
	minContrastRatio = MIN_CONTRAST_RATIO
): boolean => {
	const textColorLuminance = luminance( textColorRgb );
	const bgColorLuminance = luminance( bgColorRgb );
	const contrast = colorContrastRatio( textColorLuminance, bgColorLuminance );
	return contrast <= minContrastRatio;
};

// Works also with shorthand hex triplets such as "#03F"
export const hexToRgb = ( hex: string ) => {
	const rgbHex = hex
		.replace( /^#?([a-f\d])([a-f\d])([a-f\d])$/i, ( _m, r, g, b ) => '#' + r + r + g + g + b + b )
		.substring( 1 )
		.match( /.{2}/g );

	if ( rgbHex?.length !== 3 ) {
		throw 'Unexpected RGB hex value';
	}

	const [ r, g, b ] = rgbHex.map( ( x ) => parseInt( x, 16 ) );
	return { r, g, b };
};
