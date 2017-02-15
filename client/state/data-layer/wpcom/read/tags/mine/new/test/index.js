/**
 * External dependencies
 */
import { expect } from 'chai';
import sinon from 'sinon';

/**
 * Internal dependencies
 */
import {
	requestFollowTag as requestFollowAction,
	receiveFollowTag as receiveFollowAction,
} from 'state/reader/tags/items/actions';
import {
	requestFollow,
	receiveFollowSuccess,
	receiveFollowError,
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
const slug = 'chicken';

describe( 'follow tag request', () => {
	describe( '#requestUnfollow', () => {
		it( 'should dispatch HTTP request to tag endpoint', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();

			requestFollow( { dispatch }, action, next );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith( http( {
				apiVersion: '1.2',
				method: 'POST',
				path: `/read/tags/${ slug }/mine/new`,
				onSuccess: action,
				onFailure: action,
			} ) );
		} );

		it( 'should pass the original action along the middleware chain', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();

			requestFollow( { dispatch }, action, next );

			expect( next ).to.have.been.calledWith( action );
		} );
	} );

	describe( '#receiveUnfollowSuccess', () => {
		it( 'should dispatch the tag', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();

			receiveFollowSuccess( { dispatch }, action, next, successfulFollowResponse );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				receiveFollowAction( { payload: successfulFollowResponse, error: false } )
			);
		} );
	} );

	describe( '#receiveUnfollowError', () => {
		it( 'should dispatch error', () => {
			const action = requestFollowAction( slug );
			const dispatch = sinon.spy();
			const next = sinon.spy();
			const error = 'could not find tag';

			receiveFollowError( { dispatch }, action, next, error );

			expect( dispatch ).to.have.been.calledOnce;
			expect( dispatch ).to.have.been.calledWith(
				receiveFollowAction( { payload: error, error: true } )
			);
		} );
	} );
} );

