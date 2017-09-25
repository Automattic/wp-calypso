/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { key, clear, setItem, getItem, removeItem, length } from '../localstorage-bypass';

describe( 'localstorage-bypass', () => {
	// Spy on the original localStorage functions
	const _setItem = spy();
	const _getItem = spy( ( x ) => x );
	const _removeItem = spy();
	let db = {};

	beforeEach( () => {
		_setItem.reset();
		_getItem.reset();
		_removeItem.reset();
		db = {};
	} );

	describe( 'length', () => {
		it( 'returns the number of keys in dummy storage', () => {
			db.one = 'a';
			db.two = 'b';
			expect( length( db )() ).to.equal( 2 );
			db.three = 'c';
			expect( length( db )() ).to.equal( 3 );
		} );
	} );

	describe( 'clear', () => {
		it( 'clears all keys', () => {
			db.one = 1;
			db.two = 2;
			clear( db )();
			expect( db ).to.be.empty;
		} );
	} );

	describe( 'key', () => {
		it( 'returns a specific key', () => {
			db.first = 'a';
			db.second = 'b';

			expect( key( db )( 0 ) ).to.equal( 'first' );
			expect( key( db )( 1 ) ).to.equal( 'second' );
		} );

		it( 'returns null for a key that doesn\'t exist', () => {
			expect( key( db )( 2 ) ).to.be.null;
		} );
	} );

	describe( 'setItem', () => {
		it( 'sets an item in memory store', () => {
			setItem( db, [], _setItem )( 'key', 'value' );
			expect( db.key ).to.equal( 'value' );
		} );

		it( 'calls the original setItem function for an allowed key', () => {
			setItem( db, [ 'key' ], _setItem )( 'key', 'value' );
			expect( db.key ).to.be.undefined;
			expect( _setItem ).to.have.been.calledWith( 'key', 'value' );
		} );

		it( 'overrides an existing value', () => {
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

		it( 'gets an item in memory store', () => {
			expect( getItem( db, [], _getItem )( 'first' ) ).to.equal( 'abc' );
		} );

		it( 'calls the original getItem function for an allowed key', () => {
			expect( getItem( db, [ 'first' ], _getItem )( 'first' ) ).to.equal( 'first' );
			expect( _getItem ).to.have.been.calledWith( 'first' );
		} );

		it( 'returns null for a key that doesn\'t exist', () => {
			expect( getItem( db, [], _getItem )( 'missing' ) ).to.be.null;
		} );
	} );

	describe( 'removeItem', () => {
		beforeEach( () => {
			db.first = 'abc';
			db.second = 'def';
		} );

		it( 'removes an item in memory store', () => {
			removeItem( db, [], _removeItem )( 'first' );
			expect( db.first ).to.be.undefined;
		} );

		it( 'calls the original removeItem function for an allowed key', () => {
			removeItem( db, [ 'first' ], _removeItem )( 'first' );
			expect( db.first ).to.equal( 'abc' );
			expect( _removeItem ).to.have.been.calledWith( 'first' );
		} );

		it( 'has no effect when a key doesn\'t already exist', () => {
			removeItem( db, [], _removeItem )( 'missing' );
			expect( db ).to.deep.equal( { first: 'abc', second: 'def' } );
		} );
	} );

	it( 'should add a key, read it, then remove it', () => {
		setItem( db, [], _setItem )( 'test', 'value' );
		expect( getItem( db, [], _getItem )( 'test' ) ).to.equal( 'value' );
		removeItem( db, [], _removeItem )( 'test' );
		expect( getItem( db, [], _getItem )( 'test' ) ).to.be.null;
	} );
} );
