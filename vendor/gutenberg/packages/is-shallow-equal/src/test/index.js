/**
 * Internal Dependencies
 */
import isShallowEqual from '../';
import isShallowEqualArrays from '../arrays';
import isShallowEqualObjects from '../objects';

describe( 'isShallowEqual', () => {
	it( 'returns false if of different types', () => {
		const a = [ 1 ];
		const b = { 0: 1 };

		expect( isShallowEqual( a, b ) ).toBe( false );
		expect( isShallowEqual( b, a ) ).toBe( false );
	} );

	it( 'returns false if a object has more keys than b', () => {
		const a = { foo: 1, bar: 2 };
		const b = { foo: 1 };

		expect( isShallowEqual( a, b ) ).toBe( false );
		expect( isShallowEqual( b, a ) ).toBe( false );
	} );

	it( 'returns false if b object has more keys than a', () => {
		const a = { foo: 1 };
		const b = { foo: 1, bar: 2 };

		expect( isShallowEqual( a, b ) ).toBe( false );
		expect( isShallowEqual( b, a ) ).toBe( false );
	} );

	it( 'returns false if a object has different value than b', () => {
		const a = { foo: 1, bar: 2 };
		const b = { foo: 1, bar: 1 };

		expect( isShallowEqual( a, b ) ).toBe( false );
		expect( isShallowEqual( b, a ) ).toBe( false );
	} );

	it( 'returns false if a object has different key than b', () => {
		const a = { foo: 1, bar: 2 };
		const b = { foo: 1, baz: 2 };

		expect( isShallowEqual( a, b ) ).toBe( false );
		expect( isShallowEqual( b, a ) ).toBe( false );
	} );

	it( 'returns false if b object has different key than a', () => {
		const a = { foo: 1, baz: 2 };
		const b = { foo: 1, bar: 2 };

		expect( isShallowEqual( a, b ) ).toBe( false );
		expect( isShallowEqual( b, a ) ).toBe( false );
	} );

	it( 'returns true if a object has same values as b', () => {
		const a = { foo: 1, bar: 2 };
		const b = { foo: 1, bar: 2 };

		expect( isShallowEqual( a, b ) ).toBe( true );
		expect( isShallowEqual( b, a ) ).toBe( true );
	} );

	it( 'returns true if a object strictly equals b', () => {
		const obj = { foo: 1 };

		expect( isShallowEqual( obj, obj ) ).toBe( true );
	} );

	it( 'returns true on objects that are a copy of each other', () => {
		const a = { foo: 1 };
		const b = a;

		expect( isShallowEqual( a, b ) ).toBe( true );
	} );

	it( 'returns true on object deep-but-referentially-equal values', () => {
		const obj = {};
		const a = { foo: obj };
		const b = { foo: obj };

		expect( isShallowEqual( a, b ) ).toBe( true );
		expect( isShallowEqual( b, a ) ).toBe( true );
	} );

	it( 'returns false if a array has more keys than b', () => {
		const a = [ 1, 2 ];
		const b = [ 1 ];

		expect( isShallowEqual( a, b ) ).toBe( false );
		expect( isShallowEqual( b, a ) ).toBe( false );
	} );

	it( 'returns false if b array has more keys than a', () => {
		const a = [ 1 ];
		const b = [ 1, 2 ];

		expect( isShallowEqual( a, b ) ).toBe( false );
		expect( isShallowEqual( b, a ) ).toBe( false );
	} );

	it( 'returns false if a array has different value than b', () => {
		const a = [ 1, 1 ];
		const b = [ 1, 2 ];

		expect( isShallowEqual( a, b ) ).toBe( false );
		expect( isShallowEqual( b, a ) ).toBe( false );
	} );

	it( 'returns true if a array has same values as b', () => {
		const a = [ 1, 2 ];
		const b = [ 1, 2 ];

		expect( isShallowEqual( a, b ) ).toBe( true );
		expect( isShallowEqual( b, a ) ).toBe( true );
	} );

	it( 'returns true on array deep-but-referentially-equal values', () => {
		const obj = {};
		const a = [ obj ];
		const b = [ obj ];

		expect( isShallowEqual( a, b ) ).toBe( true );
		expect( isShallowEqual( b, a ) ).toBe( true );
	} );

	it( 'falls back to strict equality when one of arguments is non-object-like', () => {
		expect( isShallowEqual( undefined, {} ) ).toBe( false );
		expect( isShallowEqual( undefined, [] ) ).toBe( false );
		expect( isShallowEqual( undefined, undefined ) ).toBe( true );
		expect( isShallowEqual( {}, null ) ).toBe( false );
		expect( isShallowEqual( [], {} ) ).toBe( false );
		expect( isShallowEqual( null, [] ) ).toBe( false );
		expect( isShallowEqual( null, null ) ).toBe( true );
		expect( isShallowEqual( 1, true ) ).toBe( false );
		expect( isShallowEqual( true, true ) ).toBe( true );
		expect( isShallowEqual( null, undefined ) ).toBe( false );
	} );

	it( 'returns true on arrays that are a copy of each other', () => {
		const a = [];
		const b = a;

		expect( isShallowEqual( a, b ) ).toBe( true );
	} );
} );

describe( 'isShallowEqualArrays', () => {
	it( 'is exported as a clone of the function from index', () => {
		const a = [ 1, 2 ];
		const b = [ 1, 2 ];

		expect( isShallowEqualArrays( a, b ) ).toBe( true );
	} );
} );

describe( 'isShallowEqualObjects', () => {
	it( 'is exported as a clone of the function from index', () => {
		const a = { foo: 1, bar: 2 };
		const b = { foo: 1, bar: 2 };

		expect( isShallowEqualObjects( a, b ) ).toBe( true );
	} );
} );
