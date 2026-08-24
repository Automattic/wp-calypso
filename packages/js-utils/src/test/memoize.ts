import memoize from '../memoize';

describe( 'memoize', () => {
	it( 'caches by the first argument by default', () => {
		const fn = jest.fn( ( a: number, b: number ) => a + b );
		const memoized = memoize( fn );

		expect( memoized( 1, 2 ) ).toBe( 3 );
		// Same first argument returns the cached result, ignoring later arguments.
		expect( memoized( 1, 9 ) ).toBe( 3 );
		expect( memoized( 2, 2 ) ).toBe( 4 );
		expect( fn ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'uses the resolver to compute the cache key', () => {
		const fn = jest.fn( ( a: number, b: number ) => a + b );
		const memoized = memoize( fn, ( a, b ) => `${ a }-${ b }` );

		expect( memoized( 1, 2 ) ).toBe( 3 );
		expect( memoized( 1, 2 ) ).toBe( 3 );
		expect( memoized( 1, 9 ) ).toBe( 10 );
		expect( fn ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'caches falsy and undefined results', () => {
		const fn = jest.fn( () => undefined );
		const memoized = memoize( fn );

		expect( memoized( 'x' ) ).toBeUndefined();
		expect( memoized( 'x' ) ).toBeUndefined();
		expect( fn ).toHaveBeenCalledTimes( 1 );
	} );

	it( 'exposes a clearable cache', () => {
		const fn = jest.fn( ( a: number ) => a * 2 );
		const memoized = memoize( fn );

		memoized( 2 );
		expect( memoized.cache.has( 2 ) ).toBe( true );

		memoized.cache.clear();
		memoized( 2 );
		expect( fn ).toHaveBeenCalledTimes( 2 );
	} );

	it( 'forwards the caller’s `this` binding', () => {
		const memoized = memoize( function ( this: { value: number } ) {
			return this.value;
		} );

		expect( memoized.call( { value: 7 } ) ).toBe( 7 );
	} );
} );
