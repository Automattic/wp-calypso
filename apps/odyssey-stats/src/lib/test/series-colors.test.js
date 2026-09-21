import { deriveSeriesColors } from '../series-colors';

// WCAG relative luminance, duplicated here so the test asserts the property
// independently of the implementation's own helper.
const luminance = ( hex ) => {
	const value = hex.replace( '#', '' );
	const channels = [ 0, 2, 4 ].map( ( offset ) => {
		const channel = parseInt( value.slice( offset, offset + 2 ), 16 ) / 255;
		return channel <= 0.03928 ? channel / 12.92 : Math.pow( ( channel + 0.055 ) / 1.055, 2.4 );
	} );
	return 0.2126 * channels[ 0 ] + 0.7152 * channels[ 1 ] + 0.0722 * channels[ 2 ];
};

const PRIMARIES = [ '#3858e9', '#2271b1', '#a3b745', '#d64e07' ];

describe( 'deriveSeriesColors', () => {
	it( 'should return the primary unchanged as the first series', () => {
		expect( deriveSeriesColors( '#3858e9' )[ 0 ] ).toBe( '#3858e9' );
	} );

	it( 'should accept a primary without a leading hash and shorthand hex', () => {
		expect( deriveSeriesColors( '3858e9' )[ 0 ] ).toBe( '#3858e9' );
		expect( deriveSeriesColors( '#abc' )[ 0 ] ).toBe( '#aabbcc' );
	} );

	it( 'should return two distinct series', () => {
		PRIMARIES.forEach( ( primary ) => {
			const [ first, second ] = deriveSeriesColors( primary );
			expect( second ).not.toBe( first );
		} );
	} );

	// The reason the companion is luminance-matched rather than merely hue-rotated:
	// a naive rotation of the default admin blue lands on a green that reads far
	// lighter and falls below 3:1 against the widget surface.
	it( 'should match the primary luminance so neither series reads heavier', () => {
		PRIMARIES.forEach( ( primary ) => {
			const [ first, second ] = deriveSeriesColors( primary );
			expect( luminance( second ) ).toBeCloseTo( luminance( first ), 2 );
		} );
	} );

	// Not an absolute 3:1 floor: some admin scheme primaries (ectoplasm's olive, say)
	// already sit below it on a light surface, and the primary is WordPress's choice,
	// not ours. What the derivation owes is that the companion is no worse.
	it( 'should not give the companion worse surface contrast than the primary', () => {
		const surface = luminance( '#ffffff' );
		const contrast = ( color ) => ( surface + 0.05 ) / ( luminance( color ) + 0.05 );

		PRIMARIES.forEach( ( primary ) => {
			const [ first, second ] = deriveSeriesColors( primary );
			expect( contrast( second ) ).toBeGreaterThanOrEqual( contrast( first ) - 0.05 );
		} );
	} );

	it( 'should return nothing for an unparseable primary, so callers can fall back', () => {
		[ '', 'nope', '#12', 'rgb(1,2,3)' ].forEach( ( bad ) => {
			expect( deriveSeriesColors( bad ) ).toEqual( [] );
		} );
	} );
} );
