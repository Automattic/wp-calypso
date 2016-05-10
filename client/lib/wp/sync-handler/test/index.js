/**
 * External dependencies
 */
import defer from 'lodash/defer';
import { expect } from 'chai';
import { spy } from 'sinon';
import querystring from 'querystring';

/**
 * Internal dependencies
 */
import { generateKey } from '../utils';
import * as testData from './data';
import localforageMock from './mock/localforage';
import { RECORDS_LIST_KEY } from '../constants';
import useMockery from 'test/helpers/use-mockery';
import wpcomUndocumented from 'lib/wpcom-undocumented';

let wpcom, SyncHandler, hasPaginationChanged, syncOptOut, responseData, cacheIndex;

const setLocalData = data => localforageMock.setLocalData( data );

describe( 'sync-handler', () => {
	useMockery( ( mockery ) => {
		mockery.registerMock( 'localforage', localforageMock );
		( { cacheIndex } = require( '../cache-index' ) );
		const handlerMock = ( params, callback ) => {
			const key = generateKey( params );
			callback( null, responseData[ key ] );
			return responseData[ key ];
		};
		( { SyncHandler, hasPaginationChanged, syncOptOut } = require( '../' ) );
		wpcom = new SyncHandler( handlerMock );
	} );

	beforeEach( () => {
		responseData = {};
		setLocalData( {} );
	} );

	it( 'should call callback with local response', () => {
		const {
			postListKey,
			postListParams,
			postListLocalRecord,
			postListResponseBody
		} = testData;
		const callback = spy();
		setLocalData( {
			[ postListKey ]: postListLocalRecord
		} );
		wpcom( postListParams, callback );
		expect( callback.calledWith( null, postListResponseBody ) );
	} );
	it( 'should call callback with request response', ( done ) => {
		const {
			postListKey,
			postListParams,
			postListResponseBody
		} = testData;
		const callback = spy();
		responseData[ postListKey ] = postListResponseBody;
		wpcom( postListParams, callback );
		defer( () => {
			expect( callback ).to.have.been.calledOnce;
			expect( callback.calledWith( null, postListResponseBody ) );
			done();
		} );
	} );
	it( 'should call callback twice with local and request responses', ( done ) => {
		const {
			postListKey,
			postListParams,
			postListLocalRecord,
			postListResponseBody,
			postListFreshResponseBody
		} = testData;
		const callback = spy();
		setLocalData( {
			[ postListKey ]: postListLocalRecord
		} );
		responseData[ postListKey ] = postListFreshResponseBody;
		wpcom( postListParams, callback );
		defer( () => {
			expect( callback ).to.have.been.calledTwice;
			expect( callback.calledWith( null, postListResponseBody ) );
			expect( callback.calledWith( null, postListFreshResponseBody ) );
			done();
		} );
	} );
	it( 'should store cacheIndex records with matching pageSeriesKey for paginated responses', ( done ) => {
		const {
			postListKey,
			postListNextPageKey,
			postListParams,
			postListNextPageParams,
			postListResponseBody,
			postListNextPageResponseBody,
		} = testData;
		responseData = {
			[ postListKey ]: postListResponseBody,
			[ postListNextPageKey ]: postListNextPageResponseBody,
		};
		wpcom( postListParams, () => {} );
		defer( () => {
			try {
				wpcom( postListNextPageParams, () => {} );
				defer( () => {
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
				} );
			} catch ( err ) {
				done( err );
			}
		} );
	} );
	it( 'should call clearPageSeries when getting a response with an updated page_handle', ( done ) => {
		const {
			postListParams,
			postListLocalRecord,
			postListFreshResponseBody,
			postListKey,
		} = testData;
		setLocalData( { [ postListKey ]: postListLocalRecord } );
		responseData[ postListKey ] = postListFreshResponseBody;
		spy( cacheIndex, 'clearPageSeries' );
		wpcom( postListParams, () => {} );
		defer( () => {
			try {
				expect( cacheIndex.clearPageSeries.called ).to.be.true;
				cacheIndex.clearPageSeries.restore();
				done();
			} catch ( err ) {
				done( err );
			}
		} );
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
			const { postListParams, postListDifferentOrderParams } = testData;
			const key1 = generateKey( postListParams );
			const key2 = generateKey( postListDifferentOrderParams );
			expect( typeof key1 ).to.equal( 'string' );
			expect( key1 ).to.equal( key2 );
		} );
	} );

	describe( 'hasPaginationChanged', () => {
		it( 'should return false if requestResponse has no page handle', () => {
			const { postListNoHandleResponseBody } = testData;
			const result = hasPaginationChanged( postListNoHandleResponseBody, null );
			expect( result ).to.equal( false );
		} );
		it( 'should return false for call with identical response', () => {
			const { postListResponseBody } = testData;
			const identicalResponse = Object.assign( {}, postListResponseBody );
			const result = hasPaginationChanged( postListResponseBody, identicalResponse );
			expect( result ).to.equal( false );
		} );
		it( 'should return true if page handle is different', () => {
			const { postListResponseBody, postListFreshResponseBody } = testData;
			const result = hasPaginationChanged( postListResponseBody, postListFreshResponseBody );
			expect( result ).to.equal( true );
		} );
		it( 'should return false with empty local response', () => {
			const { postListResponseBody } = testData;
			const result = hasPaginationChanged( postListResponseBody, null );
			expect( result ).to.equal( false );
		} );
	} );

	describe( 'syncOptOut', () => {
		let wpcomOptOut;
		before( () => {
			wpcomOptOut = syncOptOut( wpcomUndocumented( wpcom ) );
		} );

		it( 'should call callback with network response even when local response exists', ( done ) => {
			const {
				postListKey,
				postListSiteId,
				postListParams,
				postListNextPageLocalRecord,
				postListResponseBody
			} = testData;
			const callback = spy();
			setLocalData( {
				[ postListKey ]: postListNextPageLocalRecord
			} );
			responseData[ postListKey ] = postListResponseBody;

			wpcomOptOut.skipLocalSyncResult().site( postListSiteId ).postsList( querystring.parse( postListParams.query ), callback );

			defer( () => {
				expect( callback ).to.have.been.calledOnce;
				expect( callback ).to.have.been.calledWith( null, postListResponseBody );
				done();
			} );
		} );
	} );
} );
