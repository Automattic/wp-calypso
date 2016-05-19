/**
 * External dependencies
 */
import { useNock } from 'test/helpers/use-nock';
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
	READER_POSTS_RECEIVE
} from 'state/action-types';

import {
	receiveRecommendations,
	requestRecommendations
} from '../actions';

import { sampleSuccessResponse } from '../sample_responses';

describe( 'actions', () => {
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
				.get( '/rest/v1.1/read/recommendations/start?meta=site%2Cpost' )
				.reply( 200, deepFreeze( sampleSuccessResponse ) );
		} );

		it( 'should dispatch properly when receiving a valid response', () => {
			const request = requestRecommendations()( spy );
			expect( spy ).to.have.been.calledWith( {
				type: READER_START_RECOMMENDATIONS_REQUEST
			} );
			return request.then( () => {
				expect( spy ).to.have.been.calledWith( {
					type: READER_START_RECOMMENDATIONS_REQUEST_SUCCESS,
					data: assign( { _headers: { 'content-type': 'application/json' } }, sampleSuccessResponse )
				} );

				expect( spy ).to.have.been.calledWith( {
					type: READER_START_RECOMMENDATIONS_RECEIVE,
					recommendations: [ { post_ID: 82, site_ID: 82798297 } ]
				} );

				expect( spy ).to.have.been.calledWith( {
					type: READER_SITE_UPDATE,
					payload: [ sampleSuccessResponse.recommendations[0].meta.data.site ]
				} );

				expect( spy ).to.have.been.calledWith( {
					type: READER_POSTS_RECEIVE,
					posts: [ sampleSuccessResponse.recommendations[0].meta.data.post ]
				} );
			} ).catch( ( err ) => {
				assert.fail( err, undefined, 'errback should not have been called' );
			} );
		} );
	} );
} );
