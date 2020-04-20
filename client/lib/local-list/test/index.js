/**
 * @jest-environment jsdom
 */

/**
 * External dependencies
 */
import { assert } from 'chai';

/**
 * Internal dependencies
 */
import LocalList from '../';

jest.mock( 'store', () => {
	const data = {};

	return {
		get( key ) {
			return data[ key ];
		},

		set( key, value ) {
			data[ key ] = value;
		},
	};
} );

const anExampleKey = 'day:2014-08-01';

// helper functions
function createLocalRecords( statList, qty ) {
	for ( let i = 0; i < qty; i++ ) {
		statList.set( anExampleKey + '||' + i, {} );
	}
}

describe( 'LocalList', () => {
	let statList;

	beforeAll( () => {
		statList = new LocalList( { localStoreKey: 'TestLocalListKey' } );
	} );

	describe( 'options', () => {
		test( 'should set the localStoreKey', () => {
			const statList2 = new LocalList( { localStoreKey: 'RandomKey' } );
			assert.equal( statList2.localStoreKey, 'RandomKey' );
		} );

		test( 'should set the limit', () => {
			const statList2 = new LocalList( { localStoreKey: 'RandomKey2', limit: 25 } );
			assert.equal( statList2.limit, 25 );
		} );
	} );

	describe( 'functions', () => {
		test( 'should have set function', () => {
			assert.isFunction( statList.set, 'set should be a function' );
		} );

		test( 'should have find function', () => {
			assert.isFunction( statList.find, 'find should be a function' );
		} );

		test( 'should have getData function', () => {
			assert.isFunction( statList.getData, 'getData should be a function' );
		} );

		test( 'should have clear function', () => {
			assert.isFunction( statList.clear, 'clear should be a function' );
		} );
	} );

	describe( 'getData', () => {
		test( 'should return an empty array', () => {
			assert.lengthOf( statList.getData(), 0, 'localData should be empty' );
		} );
	} );

	describe( 'clear', () => {
		test( 'should empty the localStorage', () => {
			createLocalRecords( statList, 2 );
			assert.lengthOf( statList.getData(), 2, 'localData should have two records' );

			statList.clear();
			assert.lengthOf( statList.getData(), 0, 'localData should have no records' );
		} );
	} );

	describe( 'set', () => {
		beforeAll( function () {
			statList.clear();
		} );

		test( 'should store local data for a given key', () => {
			statList.set( anExampleKey, {} );
			assert.lengthOf( statList.getData(), 1, 'localData should have one record' );
		} );

		test( 'should only store one record for a given key', () => {
			statList.set( anExampleKey, {} );
			statList.set( anExampleKey, {} );
			assert.lengthOf( statList.getData(), 1, 'localData should have one record' );
		} );

		test( 'should store multiple records for different keys', () => {
			statList.set( anExampleKey, {} );
			statList.set( anExampleKey + '-too', {} );
			assert.lengthOf( statList.getData(), 2, 'localData should have two records' );
		} );

		test( 'should store the newest record for a given key', () => {
			statList.clear();
			statList.set( anExampleKey, { newest: false } );
			statList.set( anExampleKey, { newest: true } );

			const localRecord = statList.getData()[ 0 ];
			assert.lengthOf( statList.getData(), 1, 'localData should have one record' );
			assert.isTrue( localRecord.data.newest );
		} );

		describe( 'record', () => {
			test( 'should set a key attribute', () => {
				statList.clear();
				const localRecord = statList.set( anExampleKey, {} );

				assert.equal( localRecord.key, anExampleKey, 'It should have the correct key' );
			} );

			test( 'should set a createdAt attribute', () => {
				const localRecord = statList.getData()[ 0 ];
				assert.typeOf( localRecord.createdAt, 'number', 'It should have a timestamp' );
			} );

			test( 'should set the data', () => {
				const localRecord = statList.getData()[ 0 ];
				assert.typeOf( localRecord.data, 'object', 'It should have a data object' );
			} );
		} );
	} );

	describe( 'limitLocal', () => {
		test( 'should default to only allow 10 records to be stored', () => {
			statList.clear();
			createLocalRecords( statList, 12 );
			assert.lengthOf( statList.getData(), 10, 'localData should have 10 records' );
			assert.equal(
				statList.getData()[ 9 ].key,
				anExampleKey + '||' + 11,
				'the last record should be the last created'
			);
			assert.equal(
				statList.getData()[ 0 ].key,
				anExampleKey + '||' + 2,
				'the oldest record should be correct'
			);
		} );

		test( 'should allow default limit to be overidden', () => {
			const limit = 14,
				statList2 = new LocalList( { localStoreKey: 'TestLocalListKey2', limit: limit } );
			assert.equal( statList2.limit, limit );

			for ( let i = 0; i < limit; i++ ) {
				const key = anExampleKey + '||' + i;
				statList2.set( key, {} );
			}

			assert.equal(
				statList2.getData().length,
				limit,
				'localData should have ' + limit + ' records'
			);
		} );
	} );

	describe( 'find', () => {
		test( 'should return false if record not found', () => {
			assert.isFalse( statList.find( 'chewbacca' ), 'there should not be a chewbacca in here' );
		} );

		test( 'should return the correct record', () => {
			statList.clear();
			statList.set( anExampleKey, {} );
			createLocalRecords( statList, 2 );
			const record = statList.find( anExampleKey );
			assert.equal( record.key, anExampleKey, 'Keys should match' );
		} );
	} );
} );
