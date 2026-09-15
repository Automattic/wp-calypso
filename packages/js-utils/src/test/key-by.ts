import keyBy from '../key-by';

describe( 'keyBy', () => {
	const array = [
		{ dir: 'left', code: 97 },
		{ dir: 'right', code: 100 },
	];

	it( 'should transform keys by `iteratee`', () => {
		const expected = { a: { dir: 'left', code: 97 }, d: { dir: 'right', code: 100 } };
		const actual = keyBy( array, ( object ) => {
			return String.fromCharCode( object.code );
		} );

		expect( actual ).toEqual( expected );
	} );

	it( 'should work with `_.property` shorthands', () => {
		const expected = { left: { dir: 'left', code: 97 }, right: { dir: 'right', code: 100 } };
		const actual = keyBy( array, 'dir' );

		expect( actual ).toEqual( expected );
	} );

	it( 'should only add values to own, not inherited, properties', () => {
		const actual = keyBy( [ 6.1, 4.2, 6.3 ], ( n ) => {
			return Math.floor( n ) > 4 ? 'hasOwnProperty' : 'constructor';
		} );

		expect( actual.constructor ).toEqual( 4.2 );
		expect( actual.hasOwnProperty ).toEqual( 6.3 );
	} );

	it( 'should work with a number for `iteratee`', () => {
		const array = [
			[ 1, 'a' ],
			[ 2, 'a' ],
			[ 2, 'b' ],
		];

		expect( keyBy( array, 0 ) ).toEqual( { '1': [ 1, 'a' ], '2': [ 2, 'b' ] } );
		expect( keyBy( array, 1 ) ).toEqual( { a: [ 2, 'a' ], b: [ 2, 'b' ] } );
	} );

	it( 'preserves symbol keys, key order, and the last value on collisions', () => {
		const symbol = Symbol( 'comment' );
		const values = [
			{ key: 'first', value: 1 },
			{ key: symbol, value: 2 },
			{ key: 'second', value: 3 },
			{ key: 'first', value: 4 },
			{ key: symbol, value: 5 },
		];
		const result = keyBy( values, 'key' );

		expect( Reflect.ownKeys( result ) ).toEqual( [ 'first', 'second', symbol ] );
		expect( result.first ).toBe( values[ 3 ] );
		expect( result[ symbol ] ).toBe( values[ 4 ] );
	} );

	it( 'defines prototype-sensitive keys as ordinary own data properties', () => {
		const value = { key: '__proto__' };
		const result = keyBy( [ value ], 'key' );

		expect( Object.getPrototypeOf( result ) ).toBe( Object.prototype );
		expect( Object.getOwnPropertyDescriptor( result, '__proto__' ) ).toEqual( {
			value,
			writable: true,
			enumerable: true,
			configurable: true,
		} );
	} );

	it( 'does not call inherited setters while creating keys', () => {
		const setter = jest.fn();
		const key = '__keyByTestSetter__';
		Object.defineProperty( Object.prototype, key, { set: setter, configurable: true } );
		try {
			const value = { key };
			const result = keyBy( [ value ], 'key' );
			expect( result[ key ] ).toBe( value );
			expect( setter ).not.toHaveBeenCalled();
		} finally {
			Reflect.deleteProperty( Object.prototype, key );
		}
	} );

	it( 'skips sparse slots and calls the iteratee once per present value without mutating input', () => {
		const values = new Array< { id: string } >( 4 );
		values[ 1 ] = { id: 'first' };
		values[ 3 ] = { id: 'second' };
		Object.freeze( values );
		const iteratee = jest.fn( ( value: { id: string } | undefined ) => value?.id ?? 'hole' );
		const result = keyBy( values, iteratee );

		expect( Object.keys( result ) ).toEqual( [ 'first', 'second' ] );
		expect( iteratee.mock.calls ).toEqual( [ [ values[ 1 ] ], [ values[ 3 ] ] ] );
		expect( result.first ).toBe( values[ 1 ] );
		expect( result.second ).toBe( values[ 3 ] );
	} );

	it( 'should work with an object for `collection`', () => {
		const actual = keyBy( { a: 6.1, b: 4.2, c: 6.3 }, Math.floor );
		expect( actual ).toEqual( { '4': 4.2, '6': 6.3 } );
	} );
} );
