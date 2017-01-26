/**
 * External dependencies
 */
import useMockery from 'test/helpers/use-mockery';
import useNock from 'test/helpers/use-nock';
import sinon from 'sinon';
import { expect, assert } from 'chai';
import deepFreeze from 'deep-freeze';

/**
 * Internal dependencies
 */
import {
	READER_FOLLOW,
	READER_UNFOLLOW,
	READER_FOLLOWS_RECEIVE,
	READER_FOLLOWS_REQUEST,
	READER_FOLLOWS_REQUEST_SUCCESS,
	READER_FOLLOWS_REQUEST_FAILURE,
} from 'state/action-types';

const sampleSuccessResponse = require( './sample-responses.json' );

describe( 'actions', () => {
	let recordFollow, recordUnfollow, requestFollows;

	useMockery( mockery => {
		mockery.registerMock( 'state/reader/posts/actions', {
			receivePosts: ( posts ) => {
				return Promise.resolve( posts );
			}
		} );

		const actions = require( '../actions' );
		recordFollow = actions.recordFollow;
		recordUnfollow = actions.recordUnfollow;
		requestFollows = actions.requestFollows;
	} );

	const spy = sinon.spy();
	const dispatchSpy = sinon.stub();
	dispatchSpy.withArgs( sinon.match.instanceOf( Promise ) ).returnsArg( 0 );

	beforeEach( () => {
		spy.reset();
		dispatchSpy.reset();
	} );

	describe( '#recordFollow', () => {
		it( 'should dispatch an action when a URL is followed', () => {
			recordFollow( 'http://discover.wordpress.com' )( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_FOLLOW,
				payload: { url: 'http://discover.wordpress.com' },
			} );
		} );
	} );

	describe( '#recordUnfollow', () => {
		it( 'should dispatch an action when a URL is unfollowed', () => {
			recordUnfollow( 'http://discover.wordpress.com' )( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_UNFOLLOW,
				payload: { url: 'http://discover.wordpress.com' }
			} );
		} );
	} );

	describe( '#requestFollows', () => {
		context( 'success', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.get( '/rest/v1.2/read/following/mine?page=1&number=5' )
					.reply( 200, deepFreeze( sampleSuccessResponse ) );
			} );

			it( 'should dispatch properly when receiving a valid response', () => {
				const request = requestFollows()( dispatchSpy );

				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_FOLLOWS_REQUEST,
				} );

				return request.then( () => {
					expect( dispatchSpy ).to.have.been.calledWith( {
						type: READER_FOLLOWS_REQUEST_SUCCESS,
						payload: sampleSuccessResponse,
					} );
					expect( dispatchSpy ).to.have.been.calledWith( {
						type: READER_FOLLOWS_RECEIVE,
						payload: { follows: sampleSuccessResponse.subscriptions },
					} );
				} ).catch( ( err ) => {
					assert.fail( err, undefined, 'errback should not have been called' );
				} );
			} );
		} );

		context( 'failure', () => {
			useNock( nock => {
				nock( 'https://public-api.wordpress.com:443' )
					.persist()
					.get( '/rest/v1.2/read/following/mine?page=1&number=5' )
					.reply( 500, deepFreeze( { error: 'Server Error' } ) );
			} );

			it( 'should fail when receiving an error response', () => {
				const request = requestFollows()( dispatchSpy );

				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_FOLLOWS_REQUEST,
				} );

				return request
					.then( () => {
						assert.fail( 'request should not have succeeded' );
					} )
					.catch( () => {
						expect( dispatchSpy ).to.have.been.calledWith( {
							type: READER_FOLLOWS_REQUEST_FAILURE,
							payload: sinon.match.any,
							error: true,
						} );
					} );
			} );
		} );
	} );
} );
