/**
 * External dependencies
 */
import { useNock } from 'test/helpers/use-nock';
import useMockery from 'test/helpers/use-mockery';
import sinon from 'sinon';
import { assert, expect } from 'chai';
import deepFreeze from 'deep-freeze';
import assign from 'lodash/assign';

/**
 * Internal dependencies
 */
import {
	READER_START_RECOMMENDATIONS_RECEIVE,
	READER_START_RECOMMENDATIONS_REQUEST,
	READER_START_RECOMMENDATIONS_REQUEST_SUCCESS,
	READER_SITE_UPDATE,
	READER_START_GRADUATE_REQUEST,
	READER_START_GRADUATE_REQUEST_SUCCESS,
	READER_START_GRADUATED
} from 'state/action-types';

import { sampleSuccessResponse } from '../sample_responses';

describe( 'actions', () => {
	let receiveRecommendations, requestRecommendations, requestGraduate;

	useMockery( mockery => {
		mockery.registerMock( 'state/reader/posts/actions', {
			receivePosts: ( posts ) => {
				return Promise.resolve( posts );
			}
		} );

		const actions = require( '../actions' );
		receiveRecommendations = actions.receiveRecommendations;
		requestRecommendations = actions.requestRecommendations;
		requestGraduate = actions.requestGraduate;
	} );

	const spy = sinon.spy();

	beforeEach( () => {
		spy.reset();
	} );

	describe( '#receiveRecommendations()', () => {
		it( 'should return an action object', () => {
			const recommendations = {};
			const action = receiveRecommendations( recommendations );

			expect( action ).to.eql( {
				type: READER_START_RECOMMENDATIONS_RECEIVE,
				recommendations
			} );
		} );
	} );

	describe( '#requestRecommendations', () => {
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/read/recommendations/start?meta=site%2Cpost&number=20' )
				.reply( 200, deepFreeze( sampleSuccessResponse ) );
		} );

		it( 'should dispatch properly when receiving a valid response', () => {
			const dispatchSpy = sinon.stub();
			dispatchSpy.withArgs( sinon.match.instanceOf( Promise ) ).returnsArg( 0 );
			const request = requestRecommendations()( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_START_RECOMMENDATIONS_REQUEST
			} );
			return request.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_START_RECOMMENDATIONS_REQUEST_SUCCESS,
					data: assign( { _headers: { 'content-type': 'application/json' } }, sampleSuccessResponse )
				} );

				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_START_RECOMMENDATIONS_RECEIVE,
					recommendations: [ { post_ID: 82, site_ID: 82798297 } ]
				} );

				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_SITE_UPDATE,
					payload: [ sampleSuccessResponse.recommendations[ 0 ].meta.data.site ]
				} );
			} ).catch( ( err ) => {
				assert.fail( err, undefined, 'errback should not have been called' );
			} );
		} );
	} );

	describe( '#requestGraduate', () => {
		const sampleResponse = { success: true };
		useNock( nock => {
			nock( 'https://public-api.wordpress.com:443' )
				.post( '/rest/v1.2/read/graduate-new-reader' )
				.reply( 200, deepFreeze( sampleResponse ) );
		} );

		it( 'should dispatch properly when receiving a valid response', () => {
			const dispatchSpy = sinon.stub();
			dispatchSpy.withArgs( sinon.match.instanceOf( Promise ) ).returnsArg( 0 );
			const request = requestGraduate()( dispatchSpy );
			expect( dispatchSpy ).to.have.been.calledWith( {
				type: READER_START_GRADUATE_REQUEST
			} );
			return request.then( () => {
				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_START_GRADUATE_REQUEST_SUCCESS,
					data: assign( { _headers: { 'content-type': 'application/json' } }, sampleResponse )
				} );

				expect( dispatchSpy ).to.have.been.calledWith( {
					type: READER_START_GRADUATED
				} );
			} ).catch( ( err ) => {
				assert.fail( err, undefined, 'errback should not have been called' );
			} );
		} );
	} );
} );
