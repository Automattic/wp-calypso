/**
 * Series colours for the Stats widget chart, generated from a single primary.
 *
 * The primary is whatever WordPress publishes for the current user's admin colour
 * scheme (`--wp-admin-theme-color`), so the chart follows the user's profile rather
 * than a fixed palette. Stats deliberately reads that variable instead of
 * `--color-accent` — see `client/my-sites/stats/_interactive-colors.scss`, which
 * documents that the accent "fails WCAG AA on several admin colour schemes".
 *
 * The second series is the primary rotated around the hue wheel and then pulled back
 * to the *same relative luminance*. Rotating alone is not enough: HSL lightness is not
 * perceptual, so a naive rotation of the default admin blue lands on a green that reads
 * far lighter and drops to 1.55:1 against the widget surface. Matching luminance keeps
 * both series equally weighted and above 3:1.
 */

const HUE_ROTATION = -90;

type Rgb = [ number, number, number ];

const clampByte = ( value: number ) => Math.round( Math.max( 0, Math.min( 255, value ) ) );

/**
 * Parse a 3- or 6-digit hex colour into RGB.
 * @param hex Hex colour, with or without a leading '#'.
 */
function hexToRgb( hex: string ): Rgb | null {
	const normalized = hex.trim().replace( /^#/, '' );
	const expanded =
		normalized.length === 3
			? normalized
					.split( '' )
					.map( ( char ) => char + char )
					.join( '' )
			: normalized;

	if ( ! /^[0-9a-f]{6}$/i.test( expanded ) ) {
		return null;
	}

	return [
		parseInt( expanded.slice( 0, 2 ), 16 ),
		parseInt( expanded.slice( 2, 4 ), 16 ),
		parseInt( expanded.slice( 4, 6 ), 16 ),
	];
}

/**
 * Format RGB as a hex colour.
 * @param rgb Red, green and blue channels in the 0-255 range.
 */
function rgbToHex( rgb: Rgb ): string {
	const toHex = ( value: number ) => clampByte( value ).toString( 16 ).padStart( 2, '0' );
	return `#${ toHex( rgb[ 0 ] ) }${ toHex( rgb[ 1 ] ) }${ toHex( rgb[ 2 ] ) }`;
}

/**
 * Convert RGB to hue, saturation and lightness.
 * @param rgb Red, green and blue channels in the 0-255 range.
 */
function rgbToHsl( rgb: Rgb ): [ number, number, number ] {
	const r = rgb[ 0 ] / 255;
	const g = rgb[ 1 ] / 255;
	const b = rgb[ 2 ] / 255;
	const max = Math.max( r, g, b );
	const min = Math.min( r, g, b );
	const lightness = ( max + min ) / 2;
	const delta = max - min;

	if ( delta === 0 ) {
		return [ 0, 0, lightness ];
	}

	const saturation = lightness > 0.5 ? delta / ( 2 - max - min ) : delta / ( max + min );

	let hue;
	if ( max === r ) {
		hue = ( g - b ) / delta + ( g < b ? 6 : 0 );
	} else if ( max === g ) {
		hue = ( b - r ) / delta + 2;
	} else {
		hue = ( r - g ) / delta + 4;
	}

	return [ hue * 60, saturation, lightness ];
}

/**
 * Convert hue, saturation and lightness back to RGB.
 * @param hue        Hue in degrees; wrapped into 0-360.
 * @param saturation Saturation in the 0-1 range.
 * @param lightness  Lightness in the 0-1 range.
 */
function hslToRgb( hue: number, saturation: number, lightness: number ): Rgb {
	const h = ( ( hue % 360 ) + 360 ) % 360;
	const c = ( 1 - Math.abs( 2 * lightness - 1 ) ) * saturation;
	const x = c * ( 1 - Math.abs( ( ( h / 60 ) % 2 ) - 1 ) );
	const m = lightness - c / 2;

	let rgb: Rgb;
	if ( h < 60 ) {
		rgb = [ c, x, 0 ];
	} else if ( h < 120 ) {
		rgb = [ x, c, 0 ];
	} else if ( h < 180 ) {
		rgb = [ 0, c, x ];
	} else if ( h < 240 ) {
		rgb = [ 0, x, c ];
	} else if ( h < 300 ) {
		rgb = [ x, 0, c ];
	} else {
		rgb = [ c, 0, x ];
	}

	return [ ( rgb[ 0 ] + m ) * 255, ( rgb[ 1 ] + m ) * 255, ( rgb[ 2 ] + m ) * 255 ];
}

/**
 * WCAG relative luminance.
 * @param rgb Red, green and blue channels in the 0-255 range.
 */
function relativeLuminance( rgb: Rgb ): number {
	const [ r, g, b ] = rgb.map( ( channel ) => {
		const value = channel / 255;
		return value <= 0.03928 ? value / 12.92 : Math.pow( ( value + 0.055 ) / 1.055, 2.4 );
	} );
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** wp-admin's own default, for the moment before the scheme's colour has been read. */
const DEFAULT_PRIMARY = '#3858e9';

/**
 * Derive the two chart series colours from a single primary.
 *
 * Returns the primary unchanged as the first series, and a hue-rotated,
 * luminance-matched companion as the second. An unparseable primary — including the
 * empty string the colour is until the page has been read — falls back to wp-admin's
 * default, so the chart and its colour keys always have a colour.
 * @param primary The admin colour scheme's primary, as a hex string.
 */
export function deriveSeriesColors( primary: string ): string[] {
	const rgb = hexToRgb( primary ) ?? ( hexToRgb( DEFAULT_PRIMARY ) as Rgb );

	const [ hue, saturation ] = rgbToHsl( rgb );
	const target = relativeLuminance( rgb );

	// Binary-search lightness until the rotated hue matches the primary's luminance.
	let low = 0;
	let high = 1;
	let companion = rgbToHex( rgb );
	for ( let step = 0; step < 40; step++ ) {
		const mid = ( low + high ) / 2;
		const candidate = hslToRgb( hue + HUE_ROTATION, saturation, mid );
		if ( relativeLuminance( candidate ) > target ) {
			high = mid;
		} else {
			low = mid;
		}
		companion = rgbToHex( candidate );
	}

	return [ rgbToHex( rgb ), companion ];
}
