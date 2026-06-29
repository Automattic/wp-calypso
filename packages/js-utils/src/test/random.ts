import random from '../random';

describe( 'random', () => {
	afterEach( () => {
		jest.spyOn( Math, 'random' ).mockRestore();
	} );

	const mockRandom = ( value: number ) => jest.spyOn( Math, 'random' ).mockReturnValue( value );

	it( 'should return an integer between 0 and a single argument (inclusive)', () => {
		mockRandom( 0 );
		expect( random( 5 ) ).toBe( 0 );
		mockRandom( 0.999999 );
		expect( random( 5 ) ).toBe( 5 );
	} );

	it( 'should return an integer between lower and upper (inclusive)', () => {
		mockRandom( 0 );
		expect( random( 2, 8 ) ).toBe( 2 );
		mockRandom( 0.999999 );
		expect( random( 2, 8 ) ).toBe( 8 );
	} );

	it( 'should swap the bounds when lower is greater than upper', () => {
		mockRandom( 0 );
		expect( random( 8, 2 ) ).toBe( 2 );
		mockRandom( 0.999999 );
		expect( random( 8, 2 ) ).toBe( 8 );
	} );

	it( 'should coerce numeric-string bounds to numbers', () => {
		mockRandom( 0 );
		// @ts-expect-error -- exercises lenient coercion for untyped (e.g. form) callers.
		expect( random( '10', '50' ) ).toBe( 10 );
		mockRandom( 0.999999 );
		// @ts-expect-error -- see above.
		expect( random( '10', '50' ) ).toBe( 50 );
	} );

	it( 'should return an in-range float when a bound is fractional', () => {
		mockRandom( 0.999999 );
		const value = random( 1.2, 1.5 );
		expect( Number.isInteger( value ) ).toBe( false );
		expect( value ).toBeGreaterThanOrEqual( 1.2 );
		expect( value ).toBeLessThanOrEqual( 1.5 );
	} );

	it( 'should return a float when the floating flag is set on integer bounds', () => {
		mockRandom( 0.5 );
		const value = random( 0, 10, true );
		expect( Number.isInteger( value ) ).toBe( false );
		expect( value ).toBeGreaterThanOrEqual( 0 );
		expect( value ).toBeLessThanOrEqual( 10 );
	} );

	it( 'should return 0 or 1 when called with no arguments', () => {
		mockRandom( 0 );
		expect( random() ).toBe( 0 );
		mockRandom( 0.999999 );
		expect( random() ).toBe( 1 );
	} );

	it( 'should stay within the inclusive bounds across many samples', () => {
		for ( let i = 0; i < 1000; i++ ) {
			const value = random( 3, 6 );
			expect( Number.isInteger( value ) ).toBe( true );
			expect( value ).toBeGreaterThanOrEqual( 3 );
			expect( value ).toBeLessThanOrEqual( 6 );
		}
	} );

	it( 'should treat a symbol bound as 0 instead of throwing', () => {
		mockRandom( 0.999999 );
		// @ts-expect-error -- lodash coerces non-numeric bounds rather than throwing.
		expect( random( Symbol( 'x' ) ) ).toBe( 0 );
	} );

	it( 'should produce a huge finite range for an Infinity bound', () => {
		mockRandom( 0.999999 );
		const value = random( 0, Infinity );
		expect( Number.isFinite( value ) ).toBe( true );
		expect( value ).toBeGreaterThan( 1e300 );
	} );
} );
