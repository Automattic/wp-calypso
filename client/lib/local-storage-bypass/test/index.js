import { key, clear, setItem, getItem, removeItem, length } from '..';

describe( 'localstorage-bypass', () => {
	// Spy on the original localStorage functions
	const _setItem = jest.fn();
	const _getItem = jest.fn( ( x ) => x );
	const _removeItem = jest.fn();
	let db;

	beforeEach( () => {
		db = {};
	} );

	describe( 'length', () => {
		test( 'returns the number of keys in dummy storage', () => {
			db.one = 'a';
			db.two = 'b';
			expect( length( db )() ).toEqual( 2 );
			db.three = 'c';
			expect( length( db )() ).toEqual( 3 );
		} );
	} );

	describe( 'clear', () => {
		test( 'clears all keys', () => {
			db.one = 1;
			db.two = 2;
			clear( db )();
			expect( Object.keys( db ) ).toHaveLength( 0 );
		} );
	} );

	describe( 'key', () => {
		test( 'returns a specific key', () => {
			db.first = 'a';
			db.second = 'b';

			expect( key( db )( 0 ) ).toEqual( 'first' );
			expect( key( db )( 1 ) ).toEqual( 'second' );
		} );

		test( "returns null for a key that doesn't exist", () => {
			expect( key( db )( 2 ) ).toBeNull();
		} );
	} );

	describe( 'setItem', () => {
		test( 'sets an item in memory store', () => {
			setItem( db, [], _setItem )( 'key', 'value' );
			expect( db.key ).toEqual( 'value' );
		} );

		test( 'calls the original setItem function for an allowed key', () => {
			setItem( db, [ 'key' ], _setItem )( 'key', 'value' );
			expect( db.key ).toBeUndefined();
			expect( _setItem ).toHaveBeenCalledWith( 'key', 'value' );
		} );

		test( 'when there is no original setItem, sets an item in the memory store for an allowed key', () => {
			setItem( db, [ 'key' ], undefined )( 'key', 'value' );
			expect( db.key ).toEqual( 'value' );
		} );

		test( 'overrides an existing value', () => {
			db.existing = 'abc';
			setItem( db, [], _setItem )( 'existing', 'def' );
			expect( db ).toEqual( { existing: 'def' } );
		} );
	} );

	describe( 'getItem', () => {
		beforeEach( () => {
			db.first = 'abc';
			db.second = 'def';
		} );

		test( 'gets an item in memory store', () => {
			expect( getItem( db, [], _getItem )( 'first' ) ).toEqual( 'abc' );
		} );

		test( 'calls the original getItem function for an allowed key', () => {
			expect( getItem( db, [ 'first' ], _getItem )( 'first' ) ).toEqual( 'first' );
			expect( _getItem ).toHaveBeenCalledWith( 'first' );
		} );

		test( 'when there is no original getItem, gets an item from the memory store for an allowed key', () => {
			expect( getItem( db, [], undefined )( 'first' ) ).toEqual( 'abc' );
		} );

		test( "returns null for a key that doesn't exist", () => {
			expect( getItem( db, [], _getItem )( 'missing' ) ).toBeNull();
		} );
	} );

	describe( 'removeItem', () => {
		beforeEach( () => {
			db.first = 'abc';
			db.second = 'def';
		} );

		test( 'removes an item in memory store', () => {
			removeItem( db, [], _removeItem )( 'first' );
			expect( db.first ).toBeUndefined();
		} );

		test( 'calls the original removeItem function for an allowed key', () => {
			removeItem( db, [ 'first' ], _removeItem )( 'first' );
			expect( db.first ).toEqual( 'abc' );
			expect( _removeItem ).toHaveBeenCalledWith( 'first' );
		} );

		test( 'when there is no original removeItem, removes an item from the memory store for an allowed key', () => {
			removeItem( db, [], undefined )( 'first' );
			expect( db.first ).toBeUndefined();
		} );

		test( "has no effect when a key doesn't already exist", () => {
			removeItem( db, [], _removeItem )( 'missing' );
			expect( db ).toEqual( { first: 'abc', second: 'def' } );
		} );
	} );

	test( 'should add a key, read it, then remove it', () => {
		setItem( db, [], _setItem )( 'test', 'value' );
		expect( getItem( db, [], _getItem )( 'test' ) ).toEqual( 'value' );
		removeItem( db, [], _removeItem )( 'test' );
		expect( getItem( db, [], _getItem )( 'test' ) ).toBeNull();
	} );
} );
