/**
 * External dependencies
 */
import sinon from 'sinon';
import { assert, expect } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import useNock from 'test/helpers/use-nock';
import {
	READER_SITE_BLOCK_REQUEST,
	READER_SITE_BLOCK_REQUEST_SUCCESS,
	READER_SITE_UNBLOCK_REQUEST,
	READER_SITE_UNBLOCK_REQUEST_SUCCESS,
} from 'state/action-types';
import { requestSiteBlock, requestSiteUnblock } from '../actions';

const sampleSuccessResponse = require( './sample-responses.json' );

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#requestSiteBlock', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/me/block/sites/123/new' )
				.reply( 200, deepFreeze( sampleSuccessResponse ) );
		} );

		it( 'should dispatch properly when receiving a valid response', () => {
			const siteId = 123;
			const dispatchSpy = sinon.stub();
			dispatchSpy.withArgs( sinon.match.instanceOf( Promise ) ).returnsArg( 0 );
			const request = requestSiteBlock( siteId )( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_SITE_BLOCK_REQUEST,
				siteId
			} );

			return request.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_SITE_BLOCK_REQUEST_SUCCESS,
					data: sampleSuccessResponse,
					siteId
				} );
			} ).catch( ( err ) => {
				assert.fail( err, undefined, 'errback should not have been called' );
			} );
		} );
	} );

	describe( '#requestSiteUnblock', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.1/me/block/sites/123/delete' )
				.reply( 200, deepFreeze( sampleSuccessResponse ) );
		} );

		it( 'should dispatch properly when receiving a valid response', () => {
			const siteId = 123;
			const dispatchSpy = sinon.stub();
			dispatchSpy.withArgs( sinon.match.instanceOf( Promise ) ).returnsArg( 0 );
			const request = requestSiteUnblock( siteId )( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_SITE_UNBLOCK_REQUEST,
				siteId
			} );

			return request.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_SITE_UNBLOCK_REQUEST_SUCCESS,
					data: sampleSuccessResponse,
					siteId
				} );
			} ).catch( ( err ) => {
				assert.fail( err, undefined, 'errback should not have been called' );
			} );
		} );
	} );
} );
