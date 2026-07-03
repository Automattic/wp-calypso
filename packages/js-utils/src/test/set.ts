import set from '../set';

describe( 'set', () => {
	it( 'sets a value at a simple key', () => {
		expect( set( {}, 'a', 1 ) ).toEqual( { a: 1 } );
	} );

	it( 'creates intermediate objects for a dotted path', () => {
		expect( set( {}, 'a.b.c', 5 ) ).toEqual( { a: { b: { c: 5 } } } );
	} );

	it( 'creates an array for an index-like segment (bracket notation)', () => {
		expect( set( {}, 'a[0].b', 9 ) ).toEqual( { a: [ { b: 9 } ] } );
	} );

	it( 'treats numeric array-path segments as indices, like lodash', () => {
		expect( set( {}, [ 'a', 2 ], 'x' ) ).toEqual( { a: [ undefined, undefined, 'x' ] } );
	} );

	it( 'sets a value via a single-element array path', () => {
		expect( set( {}, [ 'newKey' ], 'nv' ) ).toEqual( { newKey: 'nv' } );
	} );

	it( 'reuses existing intermediate containers and overwrites leaves', () => {
		expect( set( { a: { b: 1 } }, 'a.c', 2 ) ).toEqual( { a: { b: 1, c: 2 } } );
		expect( set( { a: 1 }, 'a', 2 ) ).toEqual( { a: 2 } );
	} );

	it( 'mutates and returns the same object', () => {
		const object = {};
		const result = set( object, 'a.b', 1 );
		expect( result ).toBe( object );
		expect( object ).toEqual( { a: { b: 1 } } );
	} );

	it( 'returns a non-object argument unchanged', () => {
		expect( set( null, 'a', 1 ) ).toBe( null );
	} );

	it( 'does not pollute the prototype', () => {
		set( {}, '__proto__.polluted', 'x' );
		expect( ( {} as Record< string, unknown > ).polluted ).toBeUndefined();
	} );

	it( 'preserves symbol path segments, like lodash', () => {
		const sym = Symbol( 's' );
		const object: Record< PropertyKey, unknown > = {};
		set( object, [ sym ], 1 );
		expect( object[ sym ] ).toBe( 1 );
		set( object, [ 'x', sym ], 2 );
		expect( ( object.x as Record< PropertyKey, unknown > )[ sym ] ).toBe( 2 );
	} );

	it( 'maps a negative-zero segment to "-0", like lodash', () => {
		expect( set( {}, [ -0 ], 9 ) ).toEqual( { '-0': 9 } );
	} );

	it( 'skips the write for a same-value (SameValueZero) assignment, like lodash', () => {
		let writes = 0;
		let stored: unknown = 5;
		const object = {};
		Object.defineProperty( object, 'a', {
			enumerable: true,
			configurable: true,
			get: () => stored,
			set: ( v ) => {
				writes++;
				stored = v;
			},
		} );

		set( object, 'a', 5 ); // same value → no write
		expect( writes ).toBe( 0 );
		set( object, 'a', 6 ); // different value → write
		expect( writes ).toBe( 1 );
	} );
} );
