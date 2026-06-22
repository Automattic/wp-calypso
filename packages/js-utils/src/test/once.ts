import once from '../once';

describe( 'once', () => {
	it( 'invokes the wrapped function only on the first call', () => {
		const fn = jest.fn( ( a: number, b: number ) => a + b );
		const wrapped = once( fn );

		expect( wrapped( 1, 2 ) ).toBe( 3 );
		expect( wrapped( 5, 6 ) ).toBe( 3 );
		expect( wrapped( 9, 9 ) ).toBe( 3 );
		expect( fn ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'forwards the caller’s `this` binding to the wrapped function', () => {
		const wrapped = once( function ( this: { value: number } ) {
			return this.value;
		} );

		expect( wrapped.call( { value: 1 } ) ).toBe( 1 );
	} );
} );
