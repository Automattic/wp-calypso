// Default background color of Lettre theme
const LETTRE_THEME_SITE_BACKGROUND_COLOR_RGB = { r: 255, g: 255, b: 255 };
// Minimum contrast ratio as per WCAG standards "at least 4.5:1 for normal text"
const MIN_CONTRAST_RATIO = 1 / 4.5;

export type RGB = {
	r: number;
	g: number;
	b: number;
};

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

const lettreThemeBgColorLuminance = luminance( LETTRE_THEME_SITE_BACKGROUND_COLOR_RGB );

export const hasMinContrast = ( textColorRgb: RGB ): boolean => {
	const textColorLuminance = luminance( textColorRgb );
	const contrast = colorContrastRatio( textColorLuminance, lettreThemeBgColorLuminance );
	return contrast <= MIN_CONTRAST_RATIO;
};
