/*
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	requestUnfollowTag as requestUnfollowAction,
	receiveUnfollowTag as receiveUnfollowAction,
} from 'state/reader/tags/items/actions';
import {
	requestUnfollow,
	receiveUnfollowTag,
	receiveError,
	fromApi,
} from '../';
import { http } from 'state/data-layer/wpcom-http/actions';

const successfulUnfollowResponse = {
	subscribed: false,
	removed_tag: '307',
	tags: [
		{
			ID: '422',
			slug: 'poetry',
			title: 'Poetry',
			display_name: 'poetry',
			URL: 'https://public-api.wordpress.com/rest/v1/read/tags/poetry/posts'
		},
		{
			ID: '69750',
			slug: 'ship',
			title: 'SHIP',
			display_name: 'ship',
			URL: 'https://public-api.wordpress.com/rest/v1/read/tags/ship/posts'
		},
	],
};

const unsuccessfulResponse = {
	...successfulUnfollowResponse,
	subscribed: true,
};

const slug = 'chicken';

describe( 'unfollow tag request', () => {
	describe( '#requestUnfollow', () => {
		it( 'should dispatch HTTP request to tag endpoint', () => {
			const action = requestUnfollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();

			requestUnfollow( { dispatch }, action, next );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( http( {
				apiVersion: '1.0',
				method: 'POST',
				path: `/read/tags/${ slug }/mine/delete`,
				onSuccess: action,
				onFailure: action,
			} ) );
		} );

		it( 'should pass the original action along the middleware chain', () => {
			const action = requestUnfollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();

			requestUnfollow( { dispatch }, action, next );

			expect( next ).to.have.been.calledWith( action );
		} );
	} );

	describe( '#receiveUnfollowSuccess', () => {
		it( 'should dispatch the tag', () => {
			const action = requestUnfollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();

			receiveUnfollowTag( { dispatch }, action, next, successfulUnfollowResponse );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				receiveUnfollowAction( {
					payload: successfulUnfollowResponse.removed_tag,
					error: false
				} )
			);
		} );

		it( 'if api reports error then should pass through an error', () => {
			const action = requestUnfollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();

			receiveUnfollowTag( { dispatch }, action, next, unsuccessfulResponse );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				receiveUnfollowAction( {
					payload: unsuccessfulResponse.removed_tag,
					error: true,
				} )
			);
		} );
	} );

	describe( '#receiveError', () => {
		it( 'should dispatch error', () => {
			const action = requestUnfollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();
			const error = 'could not find tag';

			receiveError( { dispatch }, action, next, error );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				receiveUnfollowAction( { payload: error, error: true } )
			);
		} );
	} );

	describe( '#fromApi', () => {
		it( 'should extract the removed_tag from a response', () => {
			const apiResponse = successfulUnfollowResponse;
			const normalized = fromApi( apiResponse );

			expect( normalized ).to.eql( apiResponse.removed_tag );
		} );
	} );
} );
