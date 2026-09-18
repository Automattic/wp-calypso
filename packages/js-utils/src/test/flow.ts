import flow from '../flow';

describe( 'flow', () => {
	it( 'runs functions left-to-right', () => {
		const composed = flow(
			( x: number ) => x + 1,
			( x: number ) => x * 2
		);
		expect( composed( 3 ) ).toBe( 8 );
	} );

	it( 'accepts an array of functions', () => {
		const composed = flow( [ ( x: number ) => x + 1, ( x: number ) => x * 2 ] );
		expect( composed( 3 ) ).toBe( 8 );
	} );

	it( 'flattens mixed array and variadic arguments one level', () => {
		const composed = flow(
			[ ( x: number ) => x + 1 ],
			( x: number ) => x * 2,
			( x: number ) => x - 3
		);
		expect( composed( 3 ) ).toBe( 5 );
	} );

	it( 'passes all arguments to the first function only', () => {
		const composed = flow(
			( a: number, b: number ) => a + b,
			( x: number ) => x * 10
		);
		expect( composed( 2, 3 ) ).toBe( 50 );
	} );

	it( 'returns the first argument when no functions are given', () => {
		expect( flow()( 42 ) ).toBe( 42 );
	} );

	it( 'throws up front when a composed value is not a function', () => {
		// @ts-expect-error -- exercises runtime validation of non-function values.
		expect( () => flow( [ ( x: number ) => x, undefined ] ) ).toThrow( 'Expected a function' );
		// @ts-expect-error -- see above.
		expect( () => flow( ( x: number ) => x, 'nope' ) ).toThrow( TypeError );
	} );

	it( 'forwards `this` to the composed functions', () => {
		const object = {
			factor: 10,
			scale: flow(
				function ( this: { factor: number }, x: number ) {
					return x + 1;
				},
				function ( this: { factor: number }, x: number ) {
					return x * this.factor;
				}
			),
		};
		// ( 2 + 1 ) * this.factor; both functions receive `this` === object.
		expect( object.scale( 2 ) ).toBe( 30 );
	} );
} );
