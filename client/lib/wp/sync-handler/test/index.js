/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';
import mockery from 'mockery';

/**
 * Internal dependencies
 */
import { generateKey } from '../utils';
import * as testData from './data';
import localforageMock from './localforage-mock';
import { RECORDS_LIST_KEY } from '../constants';

let wpcom, SyncHandler, hasPaginationChanged, responseData, cacheIndex;

const setLocalData = data => localforageMock.setLocalData( data );

describe( 'sync-handler', () => {
	before( () => {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		mockery.registerSubstitute( 'localforage', 'lib/wp/sync-handler/test/localforage-mock' );
		( { cacheIndex } = require( '../cache-index' ) );
		const handlerMock = ( params, callback ) => {
			const key = generateKey( params );
			callback( null, responseData[ key ] );
			return responseData[ key ];
		};
		( { SyncHandler, hasPaginationChanged } = require( '../' ) );
		wpcom = new SyncHandler( handlerMock );
	} );
	beforeEach( () => {
		responseData = {};
		setLocalData( {} );
	} );
	after( function() {
		mockery.disable();
		mockery.deregisterSubstitute( 'localforage' );
	} );
	it( 'should call callback with local response', () => {
		const {
			postListKey,
			postListParams,
			postListLocalRecord,
			postListResponseBody
		} = testData;
		const callback = sinon.spy();
		setLocalData( {
			[ postListKey ]: postListLocalRecord
		} );
		wpcom( postListParams, callback );
		expect( callback.calledWith( null, postListResponseBody ) );
	} );
	it( 'should call callback with request response', () => {
		const {
			postListKey,
			postListParams,
			postListResponseBody
		} = testData;
		const callback = sinon.spy();
		responseData[ postListKey ] = postListResponseBody;
		wpcom( postListParams, callback );
		expect( callback ).to.have.been.calledOnce;
		expect( callback.calledWith( null, postListResponseBody ) );
	} );
	it( 'should call callback twice with local and request responses', () => {
		const {
			postListKey,
			postListParams,
			postListLocalRecord,
			postListResponseBody,
			postListResponseBodyFresh
		} = testData;
		const callback = sinon.spy();
		setLocalData( {
			[ postListKey ]: postListLocalRecord
		} );
		responseData[ postListKey ] = postListResponseBodyFresh;
		wpcom( postListParams, callback );
		expect( callback ).to.have.been.calledTwice;
		expect( callback.calledWith( null, postListResponseBody ) );
		expect( callback.calledWith( null, postListResponseBodyFresh ) );
	} );
	it( 'should store cacheIndex records with matching pageSeriesKey for paginated responses', ( done ) => {
		const {
			postListKey,
			postListNextPageKey,
			postListParams,
			postListParamsNextPage,
			postListResponseBody,
			postListResponseBodyNextPage,
		} = testData;
		responseData = {
			[ postListKey ]: postListResponseBody,
			[ postListNextPageKey ]: postListResponseBodyNextPage,
		};
		wpcom( postListParams, () => {} );
		setTimeout( () => {
			try {
				wpcom( postListParamsNextPage, () => {} );
				setTimeout( () => {
					try {
						const freshData = localforageMock.getLocalData();
						const firstRecord = freshData[ RECORDS_LIST_KEY ][ 0 ];
						const secondRecord = freshData[ RECORDS_LIST_KEY ][ 1 ];
						expect( firstRecord.key ).to.not.equal( secondRecord.key );
						expect( firstRecord.pageSeriesKey ).to.equal( secondRecord.pageSeriesKey );
						done();
					} catch ( err ) {
						done( err );
					}
				}, 0 );
			} catch ( err ) {
				done( err );
			}
		}, 0 );
	} );
	it( 'should call clearPageSeries when getting a response with an updated page_handle', ( done ) => {
		const {
			postListParams,
			postListLocalRecord,
			postListResponseBodyFresh,
			postListKey,
		} = testData;
		setLocalData( { [ postListKey ]: postListLocalRecord } );
		responseData[ postListKey ] = postListResponseBodyFresh;
		sinon.spy( cacheIndex, 'clearPageSeries' );
		wpcom( postListParams, () => {} );
		setTimeout( () => {
			try {
				expect( cacheIndex.clearPageSeries.called ).to.be.true;
				cacheIndex.clearPageSeries.restore();
				done();
			} catch ( err ) {
				done( err );
			}
		}, 0 );
	} );

	describe( 'generateKey', () => {
		beforeEach( () => {
			responseData = {};
			setLocalData( {} );
		} );
		it( 'should return the same key for identical request', () => {
			const { postListParams } = testData;
			const secondRequest = Object.assign( {}, postListParams );
			const key1 = generateKey( postListParams );
			const key2 = generateKey( secondRequest );
			expect( typeof key1 ).to.equal( 'string' );
			expect( key1 ).to.equal( key2 );
		} );
		it( 'should return unique keys for different requests', () => {
			const { postListParams } = testData;
			const secondRequest = Object.assign( {}, postListParams, { query: '?filter=test' } );
			const key1 = generateKey( postListParams );
			const key2 = generateKey( secondRequest );
			expect( typeof key1 ).to.equal( 'string' );
			expect( key1 ).to.not.equal( key2 );
		} );
		it( 'should return the same key if parameters are in different order', () => {
			const { postListParams, postListParamsDifferentOrder } = testData;
			const key1 = generateKey( postListParams );
			const key2 = generateKey( postListParamsDifferentOrder );
			expect( typeof key1 ).to.equal( 'string' );
			expect( key1 ).to.equal( key2 );
		} );
	} );

	describe( 'hasPaginationChanged', () => {
		it( 'should return false if requestResponse has no page handle', () => {
			const { postListResponseBodyNoHandle } = testData;
			const result = hasPaginationChanged( postListResponseBodyNoHandle, null );
			expect( result ).to.equal( false );
		} );
		it( 'should return false for call with identical response', () => {
			const { postListResponseBody } = testData;
			const identicalResponse = Object.assign( {}, postListResponseBody );
			const result = hasPaginationChanged( postListResponseBody, identicalResponse );
			expect( result ).to.equal( false );
		} );
		it( 'should return true if page handle is different', () => {
			const { postListResponseBody, postListResponseBodyFresh } = testData;
			const result = hasPaginationChanged( postListResponseBody, postListResponseBodyFresh );
			expect( result ).to.equal( true );
		} );
		it( 'should return false with empty local response', () => {
			const { postListResponseBody } = testData;
			const result = hasPaginationChanged( postListResponseBody, null );
			expect( result ).to.equal( false );
		} );
	} );
} );
