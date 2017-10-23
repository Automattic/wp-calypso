/** @format */
/**
 * External dependencies
 */
import { assert, expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { requestSiteBlock, requestSiteUnblock } from '../actions';
import {
	READER_SITE_BLOCK_REQUEST,
	READER_SITE_BLOCK_REQUEST_SUCCESS,
	READER_SITE_BLOCK_REQUEST_FAILURE,
	READER_SITE_UNBLOCK_REQUEST,
	READER_SITE_UNBLOCK_REQUEST_SUCCESS,
	READER_SITE_UNBLOCK_REQUEST_FAILURE,
	NOTICE_CREATE,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import sampleSuccessResponse from './sample-success-response.json';
import sampleFailureResponse from './sample-failure-response.json';

describe( 'actions', () => {
	const spy = sinon.spy();
	const dispatchSpy = sinon.stub();
	dispatchSpy.withArgs( sinon.match.instanceOf( Promise ) ).returnsArg( 0 );

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#requestSiteBlock', () => {
		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.post( '/rest/v1.1/me/block/sites/123/new' )
					.reply( 200, deepFreeze( sampleSuccessResponse ) );
			} );

			test( 'should dispatch properly when receiving a valid response', () => {
				const siteId = 123;
				const request = requestSiteBlock( siteId )( dispatchSpy );

				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_SITE_BLOCK_REQUEST,
					siteId,
				} );

				return request
					.then( () => {
						expect( dispatchSpy ).to.have.been.calledWith( {
							type: READER_SITE_BLOCK_REQUEST_SUCCESS,
							data: sampleSuccessResponse,
							siteId,
						} );
					} )
					.catch( err => {
						assert.fail( err, undefined, 'errback should not have been called' );
					} );
			} );
		} );

		describe( 'failure', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.post( '/rest/v1.1/me/block/sites/124/new' )
					.reply( 200, deepFreeze( sampleFailureResponse ) );
			} );

			test( 'should fail when receiving an error response', () => {
				const siteId = 124;
				const request = requestSiteBlock( siteId )( dispatchSpy );

				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_SITE_BLOCK_REQUEST,
					siteId,
				} );

				return request.then( () => {} ).catch( () => {
					expect( dispatchSpy ).to.have.been.calledWithMatch( {
						type: READER_SITE_BLOCK_REQUEST_FAILURE,
						siteId,
					} );

					expect( dispatchSpy ).to.have.been.calledWithMatch( { type: NOTICE_CREATE } );
				} );
			} );
		} );

		describe( 'serverError', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/me/block/sites/125/new' )
					.reply( 500, deepFreeze( { error: 'Server Error' } ) );
			} );

			test( 'should fail when receiving an error response', () => {
				const siteId = 125;
				const request = requestSiteBlock( siteId )( dispatchSpy );

				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_SITE_BLOCK_REQUEST,
					siteId,
				} );

				return request.then( () => {} ).catch( () => {
					expect( dispatchSpy ).to.have.been.calledWithMatch( {
						type: READER_SITE_BLOCK_REQUEST_FAILURE,
						siteId,
					} );

					expect( dispatchSpy ).to.have.been.calledWithMatch( { type: NOTICE_CREATE } );
				} );
			} );
		} );
	} );

	describe( '#requestSiteUnblock', () => {
		describe( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.post( '/rest/v1.1/me/block/sites/123/delete' )
					.reply( 200, deepFreeze( sampleSuccessResponse ) );
			} );

			test( 'should dispatch properly when receiving a valid response', () => {
				const siteId = 123;
				const request = requestSiteUnblock( siteId )( dispatchSpy );

				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_SITE_UNBLOCK_REQUEST,
					siteId,
				} );

				return request
					.then( () => {
						expect( dispatchSpy ).to.have.been.calledWith( {
							type: READER_SITE_UNBLOCK_REQUEST_SUCCESS,
							data: sampleSuccessResponse,
							siteId,
						} );
					} )
					.catch( err => {
						assert.fail( err, undefined, 'errback should not have been called' );
					} );
			} );
		} );

		describe( 'failure', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.post( '/rest/v1.1/me/block/sites/124/new' )
					.reply( 200, deepFreeze( sampleFailureResponse ) );
			} );

			test( 'should fail when receiving an error response', () => {
				const siteId = 124;
				const request = requestSiteUnblock( siteId )( dispatchSpy );

				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_SITE_UNBLOCK_REQUEST,
					siteId,
				} );

				return request.then( () => {} ).catch( () => {
					expect( dispatchSpy ).to.have.been.calledWithMatch( {
						type: READER_SITE_UNBLOCK_REQUEST_FAILURE,
						siteId,
					} );

					expect( dispatchSpy ).to.have.been.calledWithMatch( { type: NOTICE_CREATE } );
				} );
			} );
		} );

		describe( 'serverError', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.post( '/rest/v1.1/me/block/sites/125/new' )
					.reply( 500, deepFreeze( { error: 'Server Error' } ) );
			} );

			test( 'should fail when receiving an error response', () => {
				const siteId = 125;
				const request = requestSiteUnblock( siteId )( dispatchSpy );

				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_SITE_UNBLOCK_REQUEST,
					siteId,
				} );

				return request.then( () => {} ).catch( () => {
					expect( dispatchSpy ).to.have.been.calledWithMatch( {
						type: READER_SITE_UNBLOCK_REQUEST_FAILURE,
						siteId,
					} );

					expect( dispatchSpy ).to.have.been.calledWithMatch( { type: NOTICE_CREATE } );
				} );
			} );
		} );
	} );
} );
