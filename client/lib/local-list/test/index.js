/**
 * @jest-environment jsdom
 */
jest.mock( 'store', () => {
	const data = {};

	return {
		get( key ) {
			return data[ key ];
		},

		set( key, value ) {
			data[ key ] = value;
		}
	};
} );

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependecies
 */
import LocalList from '../';

const anExampleKey = 'day:2014-08-01';

// helper functions
function createLocalRecords( statList, qty ) {
	for ( let i = 0; i < qty; i ++ ) {
		statList.set( anExampleKey + '||' + i, {} );
	}
}

describe( 'LocalList', function() {
	let statList;

	before( () => {
		statList = new LocalList( { localStoreKey: 'TestLocalListKey' } );
	} );

	describe( 'options', function() {
		it( 'should set the localStoreKey', function() {
			const statList2 = new LocalList( { localStoreKey: 'RandomKey' } );
			assert.equal( statList2.localStoreKey, 'RandomKey' );
		} );

		it( 'should set the limit', function() {
			const statList2 = new LocalList( { localStoreKey: 'RandomKey2', limit: 25 } );
			assert.equal( statList2.limit, 25 );
		} );
	} );

	describe( 'functions', function() {
		it( 'should have set function', function() {
			assert.isFunction( statList.set, 'set should be a function' );
		} );

		it( 'should have find function', function() {
			assert.isFunction( statList.find, 'find should be a function' );
		} );

		it( 'should have getData function', function() {
			assert.isFunction( statList.getData, 'getData should be a function' );
		} );

		it( 'should have clear function', function() {
			assert.isFunction( statList.clear, 'clear should be a function' );
		} );
	} );

	describe( 'getData', function() {
		it( 'should return an empty array', function() {
			assert.lengthOf( statList.getData(), 0, 'localData should be empty' );
		} );
	} );

	describe( 'clear', function() {
		it( 'should empty the localStorage', function() {
			createLocalRecords( statList, 2 );
			assert.lengthOf( statList.getData(), 2, 'localData should have two records' );

			statList.clear();
			assert.lengthOf( statList.getData(), 0, 'localData should have no records' );
		} );
	} );

	describe( 'set', function() {
		before( function() {
			statList.clear();
		} );

		it( 'should store local data for a given key', function() {
			statList.set( anExampleKey, {} );
			assert.lengthOf( statList.getData(), 1, 'localData should have one record' );
		} );

		it( 'should only store one record for a given key', function() {
			statList.set( anExampleKey, {} );
			statList.set( anExampleKey, {} );
			assert.lengthOf( statList.getData(), 1, 'localData should have one record' );
		} );

		it( 'should store multiple records for different keys', function() {
			statList.set( anExampleKey, {} );
			statList.set( anExampleKey + '-too', {} );
			assert.lengthOf( statList.getData(), 2, 'localData should have two records' );
		} );

		it( 'should store the newest record for a given key', function() {
			statList.clear();
			statList.set( anExampleKey, { newest: false } );
			statList.set( anExampleKey, { newest: true } );

			const localRecord = statList.getData()[ 0 ];
			assert.lengthOf( statList.getData(), 1, 'localData should have one record' );
			assert.isTrue( localRecord.data.newest );
		} );

		describe( 'record', function() {
			it( 'should set a key attribute', function() {
				statList.clear();
				const localRecord = statList.set( anExampleKey, {} );

				assert.equal( localRecord.key, anExampleKey, 'It should have the correct key' );
			} );

			it( 'should set a createdAt attribute', function() {
				const localRecord = statList.getData()[ 0 ];
				assert.typeOf( localRecord.createdAt, 'number', 'It should have a timestamp' );
			} );

			it( 'should set the data', function() {
				const localRecord = statList.getData()[ 0 ];
				assert.typeOf( localRecord.data, 'object', 'It should have a data object' );
			} );
		} );
	} );

	describe( 'limitLocal', function() {
		it( 'should default to only allow 10 records to be stored', function() {
			statList.clear();
			createLocalRecords( statList, 12 );
			assert.lengthOf( statList.getData(), 10, 'localData should have 10 records' );
			assert.equal( statList.getData()[ 9 ].key, anExampleKey + '||' + 11, 'the last record should be the last created' );
			assert.equal( statList.getData()[ 0 ].key, anExampleKey + '||' + 2, 'the oldest record should be correct' );
		} );

		it( 'should allow default limit to be overidden', function() {
			const limit = 14,
				statList2 = new LocalList( { localStoreKey: 'TestLocalListKey2', limit: limit } );
			assert.equal( statList2.limit, limit );

			for ( let i = 0; i < limit; i ++ ) {
				const key = anExampleKey + '||' + i;
				statList2.set( key, {} );
			}

			assert.equal( statList2.getData().length, limit, 'localData should have ' + limit + ' records' );
		} );
	} );

	describe( 'find', function() {
		it( 'should return false if record not found', function() {
			assert.isFalse( statList.find( 'chewbacca' ), 'there should not be a chewbacca in here' );
		} );

		it( 'should return the correct record', function() {
			statList.clear();
			statList.set( anExampleKey, {} );
			createLocalRecords( statList, 2 );
			const record = statList.find( anExampleKey );
			assert.equal( record.key, anExampleKey, 'Keys should match' );
		} );
	} );
} );
