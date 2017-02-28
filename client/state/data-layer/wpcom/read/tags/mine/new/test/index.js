/*
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	requestFollowTag as requestFollowAction,
	receiveTags as receiveTagsAction,
} from 'state/reader/tags/items/actions';
import {
	requestFollowTag,
	receiveFollowTag,
	receiveError,
	fromApi,
} from '../';
import { http } from 'state/data-layer/wpcom-http/actions';

export const successfulFollowResponse = {
	subscribed: true,
	added_tag: '307',
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
	...successfulFollowResponse,
	subscribed: false,
};

const slug = 'chicken';

describe( 'follow tag request', () => {
	describe( '#requestFollow', () => {
		it( 'should dispatch HTTP request to tag endpoint', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();

			requestFollowTag( { dispatch }, action, next );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( http( {
				apiVersion: '1.2',
				method: 'POST',
				path: `/read/tags/${ slug }/mine/delete`,
				onSuccess: action,
				onFailure: action,
			} ) );
		} );

		it( 'should pass the original action along the middleware chain', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();

			requestFollowTag( { dispatch }, action, next );

			expect( next ).to.have.been.calledWith( action );
		} );
	} );

	describe( '#receiveFollowSuccess', () => {
		it( 'should dispatch the tag', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();

			receiveFollowTag( { dispatch }, action, next, successfulFollowResponse );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				receiveTagsAction( {
					payload: successfulFollowResponse.removed_tag,
					error: false
				} )
			);
		} );

		it( 'if api reports error then should pass through an error', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();

			receiveFollowTag( { dispatch }, action, next, unsuccessfulResponse );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				receiveTagsAction( {
					payload: unsuccessfulResponse.removed_tag,
					error: true,
				} )
			);
		} );
	} );

	describe( '#receiveError', () => {
		it( 'should dispatch error', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();
			const error = 'could not find tag';

			receiveError( { dispatch }, action, next, error );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				receiveTagsAction( { payload: error, error: true } )
			);
		} );
	} );

	describe( '#fromApi', () => {
		it( 'should extract the removed_tag from a response', () => {
			const apiResponse = successfulFollowResponse;
			const normalized = fromApi( apiResponse );

			expect( normalized ).to.eql( apiResponse.removed_tag );
		} );
	} );
} );
