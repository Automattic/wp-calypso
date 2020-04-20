/**
 * External dependencies
 */
import { assert, expect } from 'chai';
import deepFreeze from 'deep-freeze';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import { receiveUserSuggestions, requestUserSuggestions } from '../actions';
import {
	USER_SUGGESTIONS_RECEIVE,
	USER_SUGGESTIONS_REQUEST,
	USER_SUGGESTIONS_REQUEST_SUCCESS,
} from 'state/action-types';
import useNock from 'test/helpers/use-nock';
import sampleSuccessResponse from './sample-response.json';
const siteId = 123;

describe( 'actions', () => {
	const spy = sinon.spy();

	beforeEach( () => {
		spy.resetHistory();
	} );

	describe( '#receiveUserSuggestions()', () => {
		test( 'should return an action object', () => {
			const suggestions = [];
			const action = receiveUserSuggestions( siteId, suggestions );

			expect( action ).to.eql( {
				type: USER_SUGGESTIONS_RECEIVE,
				siteId,
				suggestions,
			} );
		} );
	} );

	describe( '#requestUserSuggestions', () => {
		useNock( ( nock ) => {
			nock( 'https://public-api.wordpress.com:443' )
				.get( '/rest/v1.1/users/suggest?site_id=' + siteId )
				.reply( 200, deepFreeze( sampleSuccessResponse ) );
		} );

		test( 'should dispatch properly when receiving a valid response', () => {
			const dispatchSpy = sinon.stub();
			dispatchSpy.withArgs( sinon.match.instanceOf( Promise ) ).returnsArg( 0 );
			const request = requestUserSuggestions( siteId )( dispatchSpy );

			expect( dispatchSpy ).to.have.been.calledWith( {
				type: USER_SUGGESTIONS_REQUEST,
				siteId,
			} );

			return request
				.then( () => {
					expect( dispatchSpy ).to.have.been.calledWith( {
						type: USER_SUGGESTIONS_REQUEST_SUCCESS,
						data: sampleSuccessResponse,
						siteId,
					} );

					expect( dispatchSpy ).to.have.been.calledWith( {
						type: USER_SUGGESTIONS_RECEIVE,
						suggestions: sampleSuccessResponse.suggestions,
						siteId,
					} );
				} )
				.catch( ( err ) => {
					assert.fail( err, undefined, 'errback should not have been called' );
				} );
		} );
	} );
} );
