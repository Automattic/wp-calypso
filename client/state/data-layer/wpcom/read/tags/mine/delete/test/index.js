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
	receiveUnfollowSuccess,
	receiveUnfollowError,
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
				apiVersion: '1.2',
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

			receiveUnfollowSuccess( { dispatch }, action, next, successfulUnfollowResponse );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				receiveUnfollowAction( { payload: successfulUnfollowResponse, error: false } )
			);
		} );
	} );

	describe( '#receiveUnfollowError', () => {
		it( 'should dispatch error', () => {
			const action = requestUnfollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();
			const error = 'could not find tag';

			receiveUnfollowError( { dispatch }, action, next, error );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				receiveUnfollowAction( { payload: error, error: true } )
			);
		} );
	} );
} );

