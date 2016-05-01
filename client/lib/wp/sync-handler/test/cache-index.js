/**
 * External dependencies
 */
import { expect } from 'chai';
import ms from 'ms';

/**
 * Internal dependencies
 */
import { RECORDS_LIST_KEY } from '../constants';
import { normalizeRequestParams } from '../utils';
import * as testData from './data';
import localforageMock from './mock/localforage';
import useMockery from 'test/helpers/use-mockery';

let cacheIndex;

const localData = () => localforageMock.getLocalData();
const setLocalData = data => localforageMock.setLocalData( data );
const clearLocal = () => setLocalData( {} );

describe( 'cache-index', () => {
	useMockery( ( mockery ) => {
		mockery.registerMock( 'localforage', localforageMock );
		( { cacheIndex } = require( '../cache-index' ) );
	} );

	beforeEach( clearLocal ); // also do inside nested blocks with >1 test

	describe( '#getAll', () => {
		beforeEach( clearLocal );

		it( 'should return undefined for empty localforage', ( done ) => {
			return cacheIndex.getAll()
				.then( res => {
					try {
						expect( res ).to.equal( undefined );
						done();
					} catch ( err ) {
						done( err );
					}
				}, ( err ) => done( err ) );
		} );
		it( 'should return index from localforage and nothing else', ( done ) => {
			const { recordsList } = testData;
			setLocalData( {
				someStoredRecord: 1,
				someOtherRecord: 2,
				[ RECORDS_LIST_KEY ]: recordsList
			} );
			return cacheIndex.getAll()
				.then( res => {
					try {
						expect( res ).to.equal( recordsList );
						done();
					} catch ( err ) {
						done( err );
					}
				}, ( err ) => done( err ) );
		} );
	} );

	describe( '#addItem', () => {
		beforeEach( clearLocal ); // also do inside nested blocks with >1 test

		it( 'should add item to empty index', ( done ) => {
			const key = 'unique-key';
			return cacheIndex.addItem( key )
				.then( () => {
					try {
						const currentIndex = localforageMock.getLocalData()[ RECORDS_LIST_KEY ];
						expect( currentIndex ).to.be.an( 'array' );
						expect( currentIndex[0] ).to.have.property( 'key', key );
						expect( currentIndex[0] ).to.have.property( 'timestamp' );
						done();
					} catch ( err ) {
						done( err );
					}
				}, ( err ) => done( err ) );
		} );
		it( 'should store a pageSeriesKey when passed as third parameter', ( done ) => {
			const { postListKey, postListParams, postListPageSeriesKey } = testData;
			const normalizedParams = normalizeRequestParams( postListParams );
			return cacheIndex.addItem( postListKey, normalizedParams, postListPageSeriesKey )
				.then( () => {
					try {
						const currentIndex = localforageMock.getLocalData()[ RECORDS_LIST_KEY ];
						expect( currentIndex ).to.be.an( 'array' );
						expect( currentIndex[0] ).to.have.property( 'key', postListKey );
						expect( currentIndex[0] ).to.have.property( 'pageSeriesKey', postListPageSeriesKey );
						expect( currentIndex[0] ).to.have.property( 'timestamp' );
						done();
					} catch ( err ) {
						done( err );
					}
				}, ( err ) => done( err ) );
		} );
	} );

	describe( '#removeItem', () => {
		it( 'should remove item from a populated index', ( done ) => {
			const { postListKey, localDataFull } = testData;
			setLocalData( localDataFull );
			return cacheIndex.removeItem( postListKey )
				.then( () => {
					try {
						const currentIndex = localData()[ RECORDS_LIST_KEY ];
						expect( currentIndex.length ).to.eql( 2 );
						done();
					} catch ( err ) {
						done( err );
					}
				}, ( err ) => done( err ) );
		} );
	} );

	describe( '#pruneStaleRecords', () => {
		it( 'should prune old records', ( done ) => {
			const {
				postListKey,
				postListWithSearchKey,
				postListLocalRecord,
				postListWithSearchLocalRecord,
			} = testData;
			const now = Date.now();
			const yesterday = now - ms( '1 day' );
			setLocalData( {
				[ postListKey ]: postListLocalRecord,
				[ postListWithSearchKey ]: postListWithSearchLocalRecord,
				[ RECORDS_LIST_KEY ]: [
					{ key: postListKey, timestamp: now },
					{ key: postListWithSearchKey, timestamp: yesterday },
				]
			} );
			return cacheIndex.pruneStaleRecords( '1 hour' )
				.then( () => {
					try {
						const freshData = localData();
						const currentIndex = freshData[ RECORDS_LIST_KEY ];
						expect( currentIndex ).to.eql( [ { key: postListKey, timestamp: now } ] );
						expect( freshData ).to.have.property( postListKey, postListLocalRecord );
						expect( freshData ).to.have.property( RECORDS_LIST_KEY );
						expect( freshData ).to.not.have.property( postListWithSearchKey );
						done();
					} catch ( err ) {
						done( err );
					}
				}, ( err ) => done( err ) );
		} );
	} );

	describe( '#clearAll', () => {
		it( 'should clear all sync records and nothing else', ( done ) => {
			const { localDataFull } = testData;
			setLocalData( Object.assign( { someRecord: 1 }, localDataFull ) );
			return cacheIndex.clearAll()
				.then( () => {
					try {
						const freshData = localData();
						expect( freshData ).to.eql( { someRecord: 1 } );
						done();
					} catch ( err ) {
						done( err );
					}
				}, ( err ) => done( err ) );
		} );
	} );

	describe( '#clearPageSeries', () => {
		it( 'should clear records with matching pageSeriesKey and leave other records intact', ( done ) => {
			const {
				postListKey,
				postListNextPageKey,
				postListWithSearchKey,
				postListPageSeriesKey,
				postListDifferentPageSeriesKey,
				postListLocalRecord,
				postListNextPageParams,
				postListNextPageLocalRecord,
			} = testData;
			const now = Date.now();
			setLocalData( {
				someOtherRecord: 1,
				[ postListKey ]: postListLocalRecord,
				[ postListNextPageKey ]: postListNextPageLocalRecord,
				[ postListWithSearchKey ]: Object.assign( {}, postListLocalRecord ),
				[ RECORDS_LIST_KEY ]: [
					{ key: postListKey, pageSeriesKey: postListPageSeriesKey, timestamp: now },
					{ key: postListNextPageKey, pageSeriesKey: postListPageSeriesKey, timestamp: now },
					{ key: postListWithSearchKey, pageSerieKey: postListDifferentPageSeriesKey, timestamp: now },
				]
			} );
			return cacheIndex.clearPageSeries( postListNextPageParams )
				.then( () => {
					try {
						const freshData = localData();
						expect( freshData ).to.eql( { someOtherRecord: 1, [ postListWithSearchKey ]: postListLocalRecord, [ RECORDS_LIST_KEY ]: [ { key: postListWithSearchKey, pageSerieKey: postListDifferentPageSeriesKey, timestamp: now } ] } );
						done();
					} catch ( err ) {
						done( err );
					}
				}, ( err ) => done( err ) );
		} );
	} );

	describe( '#clearRecordsByParamFilter', () => {
		it( 'should clear records with reqParams that matches filter and leave other records intact', ( done ) => {
			const {
				postListKey,
				postListParams,
				postListLocalRecord,
				postListDifferentSiteKey,
				postListDifferentSiteParams,
				postListDifferentSiteLocalRecord
			} = testData;
			const now = Date.now();
			setLocalData( {
				[ postListKey ]: postListLocalRecord,
				[ postListDifferentSiteKey ]: postListDifferentSiteLocalRecord,
				[ RECORDS_LIST_KEY ]: [
					{ key: postListKey, reqParams: postListParams, pageSeriesKey: 'doesnotmatter', timestamp: now },
					{ key: postListDifferentSiteKey, reqParams: postListDifferentSiteParams, pageSeriesKey: 'stilldoesnotmatter', timestamp: now }
				]
			} );
			const matchSiteFilter = ( reqParams ) => {
				return reqParams.path === '/sites/bobinprogress2.wordpress.com/posts';
			};
			return cacheIndex.clearRecordsByParamFilter( matchSiteFilter )
				.then( () => {
					try {
						const freshData = localData();
						expect( freshData ).to.have.property( postListKey );
						expect( freshData ).to.not.have.property( postListDifferentSiteKey );
						expect( freshData[ RECORDS_LIST_KEY ].length ).to.eql( 1 );
						done();
					} catch ( err ) {
						done( err );
					}
				}, ( err ) => done( err ) );
		} );
	} );
} );
