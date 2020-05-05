/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { key, clear, setItem, getItem, removeItem, length } from '..';

describe( 'localstorage-bypass', () => {
	// Spy on the original localStorage functions
	const _setItem = spy();
	const _getItem = spy( ( x ) => x );
	const _removeItem = spy();
	let db = {};

	beforeEach( () => {
		_setItem.resetHistory();
		_getItem.resetHistory();
		_removeItem.resetHistory();
		db = {};
	} );

	describe( 'length', () => {
		test( 'returns the number of keys in dummy storage', () => {
			db.one = 'a';
			db.two = 'b';
			expect( length( db )() ).to.equal( 2 );
			db.three = 'c';
			expect( length( db )() ).to.equal( 3 );
		} );
	} );

	describe( 'clear', () => {
		test( 'clears all keys', () => {
			db.one = 1;
			db.two = 2;
			clear( db )();
			expect( db ).to.be.empty;
		} );
	} );

	describe( 'key', () => {
		test( 'returns a specific key', () => {
			db.first = 'a';
			db.second = 'b';

			expect( key( db )( 0 ) ).to.equal( 'first' );
			expect( key( db )( 1 ) ).to.equal( 'second' );
		} );

		test( "returns null for a key that doesn't exist", () => {
			expect( key( db )( 2 ) ).to.be.null;
		} );
	} );

	describe( 'setItem', () => {
		test( 'sets an item in memory store', () => {
			setItem( db, [], _setItem )( 'key', 'value' );
			expect( db.key ).to.equal( 'value' );
		} );

		test( 'calls the original setItem function for an allowed key', () => {
			setItem( db, [ 'key' ], _setItem )( 'key', 'value' );
			expect( db.key ).to.be.undefined;
			expect( _setItem ).to.have.been.calledWith( 'key', 'value' );
		} );

		test( 'when there is no original setItem, sets an item in the memory store for an allowed key', () => {
			setItem( db, [ 'key' ], undefined )( 'key', 'value' );
			expect( db.key ).to.equal( 'value' );
		} );

		test( 'overrides an existing value', () => {
			db.existing = 'abc';
			setItem( db, [], _setItem )( 'existing', 'def' );
			expect( db ).to.deep.equal( { existing: 'def' } );
		} );
	} );

	describe( 'getItem', () => {
		beforeEach( () => {
			db.first = 'abc';
			db.second = 'def';
		} );

		test( 'gets an item in memory store', () => {
			expect( getItem( db, [], _getItem )( 'first' ) ).to.equal( 'abc' );
		} );

		test( 'calls the original getItem function for an allowed key', () => {
			expect( getItem( db, [ 'first' ], _getItem )( 'first' ) ).to.equal( 'first' );
			expect( _getItem ).to.have.been.calledWith( 'first' );
		} );

		test( 'when there is no original getItem, gets an item from the memory store for an allowed key', () => {
			expect( getItem( db, [], undefined )( 'first' ) ).to.equal( 'abc' );
		} );

		test( "returns null for a key that doesn't exist", () => {
			expect( getItem( db, [], _getItem )( 'missing' ) ).to.be.null;
		} );
	} );

	describe( 'removeItem', () => {
		beforeEach( () => {
			db.first = 'abc';
			db.second = 'def';
		} );

		test( 'removes an item in memory store', () => {
			removeItem( db, [], _removeItem )( 'first' );
			expect( db.first ).to.be.undefined;
		} );

		test( 'calls the original removeItem function for an allowed key', () => {
			removeItem( db, [ 'first' ], _removeItem )( 'first' );
			expect( db.first ).to.equal( 'abc' );
			expect( _removeItem ).to.have.been.calledWith( 'first' );
		} );

		test( 'when there is no original removeItem, removes an item from the memory store for an allowed key', () => {
			removeItem( db, [], undefined )( 'first' );
			expect( db.first ).to.be.undefined;
		} );

		test( "has no effect when a key doesn't already exist", () => {
			removeItem( db, [], _removeItem )( 'missing' );
			expect( db ).to.deep.equal( { first: 'abc', second: 'def' } );
		} );
	} );

	test( 'should add a key, read it, then remove it', () => {
		setItem( db, [], _setItem )( 'test', 'value' );
		expect( getItem( db, [], _getItem )( 'test' ) ).to.equal( 'value' );
		removeItem( db, [], _removeItem )( 'test' );
		expect( getItem( db, [], _getItem )( 'test' ) ).to.be.null;
	} );
} );
