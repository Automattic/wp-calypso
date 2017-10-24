/**
 * @format
 * @jest-environment jsdom
 */

/**
 * External dependencies
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
			expect( statList2.localStoreKey ).toEqual( 'RandomKey' );
		} );

		test( 'should set the limit', () => {
			const statList2 = new LocalList( { localStoreKey: 'RandomKey2', limit: 25 } );
			expect( statList2.limit ).toEqual( 25 );
		} );
	} );

	describe( 'functions', () => {
		test( 'should have set function', () => {
			expect( typeof statList.set ).toBe( 'function' );
		} );

		test( 'should have find function', () => {
			expect( typeof statList.find ).toBe( 'function' );
		} );

		test( 'should have getData function', () => {
			expect( typeof statList.getData ).toBe( 'function' );
		} );

		test( 'should have clear function', () => {
			expect( typeof statList.clear ).toBe( 'function' );
		} );
	} );

	describe( 'getData', () => {
		test( 'should return an empty array', () => {
			expect( statList.getData().length ).toBe( 0 );
		} );
	} );

	describe( 'clear', () => {
		test( 'should empty the localStorage', () => {
			createLocalRecords( statList, 2 );
			expect( statList.getData().length ).toBe( 2 );

			statList.clear();
			expect( statList.getData().length ).toBe( 0 );
		} );
	} );

	describe( 'set', () => {
		beforeAll( function() {
			statList.clear();
		} );

		test( 'should store local data for a given key', () => {
			statList.set( anExampleKey, {} );
			expect( statList.getData().length ).toBe( 1 );
		} );

		test( 'should only store one record for a given key', () => {
			statList.set( anExampleKey, {} );
			statList.set( anExampleKey, {} );
			expect( statList.getData().length ).toBe( 1 );
		} );

		test( 'should store multiple records for different keys', () => {
			statList.set( anExampleKey, {} );
			statList.set( anExampleKey + '-too', {} );
			expect( statList.getData().length ).toBe( 2 );
		} );

		test( 'should store the newest record for a given key', () => {
			statList.clear();
			statList.set( anExampleKey, { newest: false } );
			statList.set( anExampleKey, { newest: true } );

			const localRecord = statList.getData()[ 0 ];
			expect( statList.getData().length ).toBe( 1 );
			expect( localRecord.data.newest ).toBe( true );
		} );

		describe( 'record', () => {
			test( 'should set a key attribute', () => {
				statList.clear();
				const localRecord = statList.set( anExampleKey, {} );

				expect( localRecord.key ).toEqual( anExampleKey );
			} );

			test( 'should set a createdAt attribute', () => {
				const localRecord = statList.getData()[ 0 ];
				expect( typeof localRecord.createdAt ).toBe( 'number' );
			} );

			test( 'should set the data', () => {
				const localRecord = statList.getData()[ 0 ];
				expect( typeof localRecord.data ).toBe( 'object' );
			} );
		} );
	} );

	describe( 'limitLocal', () => {
		test( 'should default to only allow 10 records to be stored', () => {
			statList.clear();
			createLocalRecords( statList, 12 );
			expect( statList.getData().length ).toBe( 10 );
			expect( statList.getData()[ 9 ].key ).toEqual( anExampleKey + '||' + 11 );
			expect( statList.getData()[ 0 ].key ).toEqual( anExampleKey + '||' + 2 );
		} );

		test( 'should allow default limit to be overidden', () => {
			const limit = 14,
				statList2 = new LocalList( { localStoreKey: 'TestLocalListKey2', limit: limit } );
			expect( statList2.limit ).toEqual( limit );

			for ( let i = 0; i < limit; i++ ) {
				const key = anExampleKey + '||' + i;
				statList2.set( key, {} );
			}

			expect( statList2.getData().length ).toEqual( limit );
		} );
	} );

	describe( 'find', () => {
		test( 'should return false if record not found', () => {
			expect( statList.find( 'chewbacca' ) ).toBe( false );
		} );

		test( 'should return the correct record', () => {
			statList.clear();
			statList.set( anExampleKey, {} );
			createLocalRecords( statList, 2 );
			const record = statList.find( anExampleKey );
			expect( record.key ).toEqual( anExampleKey );
		} );
	} );
} );
