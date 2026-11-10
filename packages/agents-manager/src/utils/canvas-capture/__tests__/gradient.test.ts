import { parseLinearGradient } from '../gradient';
import type { Rgba } from '../gradient';

// Only what a computed style gives: `rgb()`, `rgba()` and `transparent`.
const parseColour = ( value: string ): Rgba | null => {
	if ( value === 'transparent' ) {
		return { r: 0, g: 0, b: 0, a: 0 };
	}

	const match = /^rgba?\((\d+), (\d+), (\d+)(?:, ([\d.]+))?\)$/.exec( value );

	return match
		? { r: +match[ 1 ], g: +match[ 2 ], b: +match[ 3 ], a: match[ 4 ] ? +match[ 4 ] : 1 }
		: null;
};

const BOX = { left: 0, top: 0, width: 200, height: 100 };
const BLACK = 'rgb(0, 0, 0)';
const WHITE = 'rgb(255, 255, 255)';

const gradientOf = ( value: string, box = BOX ) => parseLinearGradient( value, box, parseColour );

// Rounded, so the arithmetic of the blend is not what is under test.
const at = ( value: string, x: number, y: number, box = BOX ) => {
	const colour = gradientOf( value, box )?.colourAt( x, y );

	return (
		colour && {
			r: Math.round( colour.r ),
			g: Math.round( colour.g ),
			b: Math.round( colour.b ),
			a: Math.round( colour.a * 100 ) / 100,
		}
	);
};

describe( 'parseLinearGradient', () => {
	it( 'runs top to bottom by default', () => {
		const value = `linear-gradient(${ BLACK }, ${ WHITE })`;

		expect( at( value, 100, 0 ) ).toEqual( { r: 0, g: 0, b: 0, a: 1 } );
		expect( at( value, 100, 50 ) ).toEqual( { r: 128, g: 128, b: 128, a: 1 } );
		expect( at( value, 100, 100 ) ).toEqual( { r: 255, g: 255, b: 255, a: 1 } );
	} );

	it( 'runs towards a side', () => {
		const value = `linear-gradient(to right, ${ BLACK } 0%, ${ WHITE } 100%)`;

		expect( at( value, 0, 50 )?.r ).toBe( 0 );
		expect( at( value, 50, 50 )?.r ).toBe( 64 );
		expect( at( value, 200, 50 )?.r ).toBe( 255 );
	} );

	it.each( [
		[ '90deg', 'to right' ],
		[ '0.25turn', 'to right' ],
		[ '180deg', 'to bottom' ],
		[ '270deg', 'to left' ],
	] )( 'reads %s as %s', ( angle, side ) => {
		const byAngle = `linear-gradient(${ angle }, ${ BLACK }, ${ WHITE })`;
		const bySide = `linear-gradient(${ side }, ${ BLACK }, ${ WHITE })`;

		[
			[ 20, 30 ],
			[ 150, 80 ],
		].forEach( ( [ x, y ] ) =>
			expect( gradientOf( byAngle )?.colourAt( x, y ).r ).toBeCloseTo(
				gradientOf( bySide )?.colourAt( x, y ).r as number
			)
		);
	} );

	// Towards a corner, the line is perpendicular to the diagonal joining the
	// two corners either side of it: in a wide box, both of those corners sit
	// on the line's midpoint.
	it( 'runs towards a corner across the box’s other diagonal', () => {
		const value = `linear-gradient(to top right, ${ BLACK }, ${ WHITE })`;

		expect( at( value, 0, 0 )?.r ).toBe( 128 );
		expect( at( value, 200, 100 )?.r ).toBe( 128 );
		expect( at( value, 0, 100 )?.r ).toBe( 0 );
		expect( at( value, 200, 0 )?.r ).toBe( 255 );
	} );

	it( 'places pixel stops, holds the end colours past them, and spreads unplaced stops evenly', () => {
		const value = `linear-gradient(to right, ${ BLACK } 50px, rgb(100, 100, 100), ${ WHITE } 150px)`;

		expect( at( value, 10, 0 )?.r ).toBe( 0 );
		expect( at( value, 100, 0 )?.r ).toBe( 100 );
		expect( at( value, 190, 0 )?.r ).toBe( 255 );
	} );

	it( 'reads a double position as two stops, for a hard edge', () => {
		const value = `linear-gradient(to right, ${ BLACK } 0% 50%, ${ WHITE } 50% 100%)`;

		expect( at( value, 99, 0 )?.r ).toBe( 0 );
		expect( at( value, 101, 0 )?.r ).toBe( 255 );
	} );

	// Blended straight, a fade to transparent black would darken on its way.
	it( 'blends towards a transparent stop with its alpha premultiplied, as browsers do', () => {
		const value = `linear-gradient(to right, ${ WHITE }, rgba(0, 0, 0, 0))`;

		expect( at( value, 100, 0 ) ).toEqual( { r: 255, g: 255, b: 255, a: 0.5 } );
	} );

	it( 'places the gradient in the coordinates of the box it was given', () => {
		const value = `linear-gradient(to right, ${ BLACK }, ${ WHITE })`;
		const box = { left: 1000, top: 500, width: 200, height: 100 };

		expect( at( value, 1000, 550, box )?.r ).toBe( 0 );
		expect( at( value, 1200, 550, box )?.r ).toBe( 255 );
	} );

	it.each( [
		[ 'a radial gradient', `radial-gradient(${ BLACK }, ${ WHITE })` ],
		[ 'a repeating gradient', `repeating-linear-gradient(${ BLACK } 0px, ${ WHITE } 10px)` ],
		[
			'layered gradients',
			`linear-gradient(${ BLACK }, ${ WHITE }), linear-gradient(${ WHITE }, ${ BLACK })`,
		],
		[ 'an image', 'url("photo.jpg")' ],
		[ 'a colour hint', `linear-gradient(${ BLACK }, 30%, ${ WHITE })` ],
		[ 'a calc() position', `linear-gradient(${ BLACK } calc(10% + 5px), ${ WHITE })` ],
		[ 'an interpolation colour space', `linear-gradient(in oklab, ${ BLACK }, ${ WHITE })` ],
		[ 'a single stop', `linear-gradient(${ BLACK })` ],
		[ 'a colour it cannot read', `linear-gradient(oklch(0.5 0.1 200), ${ WHITE })` ],
	] )( 'gives nothing for %s', ( _, value ) => {
		expect( gradientOf( value ) ).toBeNull();
	} );

	it( 'gives nothing for a box with no size', () => {
		expect(
			gradientOf( `linear-gradient(${ BLACK }, ${ WHITE })`, {
				left: 0,
				top: 0,
				width: 0,
				height: 0,
			} )
		).toBeNull();
	} );
} );
