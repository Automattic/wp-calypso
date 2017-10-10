/** @format */

/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import localForageBypass from '../localforage-bypass';

describe( 'localforage-bypass', () => {
	const localForage = localForageBypass;
	let db = null;

	beforeEach( () => {
		localForage.ready = () => Promise.resolve();
		return localForage._initStorage( {} ).then( () => {
			db = localForage._dbInfo.db;
		} );
	} );

	describe( 'keys', () => {
		test( 'should list all keys', () => {
			db.one = 1;
			db.two = 2;
			return localForage.keys().then( keys => {
				expect( keys ).to.have.length( 2 );
				expect( keys ).to.deep.equal( [ 'one', 'two' ] );
			} );
		} );

		test( 'should be empty when initialized', () => {
			return localForage.keys().then( keys => {
				expect( keys ).to.have.length( 0 );
			} );
		} );
	} );

	describe( 'length', () => {
		const length = () => localForage.length();
		const expectLength = expected => {
			return () => {
				return length().then( l => expect( l ).to.equal( expected ) );
			};
		};
		const addItem = ( key, value ) => {
			return () => localForage.setItem( key, value );
		};

		test( 'should be zero when initialized', () => {
			return expectLength( 0 )();
		} );

		test( 'should match number of items', () => {
			db.one = 1;
			db.two = 2;
			return expectLength( 2 )();
		} );

		test( 'should increment after setItem', () => {
			db.one = 1;
			db.two = 2;

			return expectLength( 2 )()
				.then( addItem( 'eight', 8 ) )
				.then( expectLength( 3 ) );
		} );

		test( 'should not increment after setItem where key already exists', () => {
			db.one = 1;
			db.two = 2;

			return expectLength( 2 )()
				.then( addItem( 'two', 9 ) )
				.then( length )
				.then( expectLength( 2 ) );
		} );
	} );

	describe( 'clear', () => {
		test( 'should remove all keys', () => {
			db.one = 1;
			db.two = 2;
			return localForage.clear().then( () => {
				expect( db ).to.be.empty;
			} );
		} );
	} );

	describe( 'getItem', () => {
		test( 'should get an item that exists', () => {
			db.one = 1;
			return localForage.getItem( 'one' ).then( value => {
				expect( value ).to.equal( 1 );
			} );
		} );

		test( "should return undefined for an item that doesn't exist", () => {
			db.one = 1;
			localForage.getItem( 'two' ).then( value => {
				expect( value ).to.be.undefined;
			} );
		} );
	} );

	describe( 'setItem', () => {
		test( 'should set an item', () => {
			localForage.setItem( 'abc', 123 ).then( () => {
				expect( db.abc ).to.equal( 123 );
			} );
		} );

		test( 'should overwrite an item', () => {
			db.abc = 'not a number';
			localForage.setItem( 'abc', 123 ).then( () => {
				expect( db.abc ).to.equal( 123 );
			} );
		} );
	} );

	describe( 'removeItem', () => {
		test( 'should remove an item', () => {
			db.one = 1;
			db.two = 2;
			db.three = 3;
			localForage.removeItem( 'two' ).then( () => {
				expect( db ).to.deep.equal( { one: 1, three: 3 } );
			} );
		} );

		test( "should silently fail to remove item that doesn't exist", () => {
			db.one = 1;
			db.two = 2;
			db.three = 3;
			localForage.removeItem( 'four' ).then( () => {
				expect( db ).to.deep.equal( {
					one: 1,
					two: 2,
					three: 3,
				} );
			} );
		} );
	} );
} );
