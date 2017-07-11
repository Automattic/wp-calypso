/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';
import { merge } from 'lodash';

/**
 * Internal Dependencies
 */
import {
	requestUpdatePostEmailSubscription,
	receiveUpdatePostEmailSubscription,
	receiveUpdatePostEmailSubscriptionError,
} from '../';
import { updateNewPostEmailSubscription } from 'state/reader/follows/actions';
import { http } from 'state/data-layer/wpcom-http/actions';
import { local } from 'state/data-layer/utils';

describe( 'comment-email-subscriptions', () => {
	describe( 'requestUpdatePostEmailSubscription', () => {
		it( 'should dispatch an http request with revert info on the success and failure actions', () => {
			const dispatch = spy();
			const getState = () => {
				return {
					reader: {
						follows: {
							items: {
								foo: {
									blog_ID: 1234,
									delivery_frequency: {
										email: {
											post_delivery_frequency: 'instantly',
										},
									},
								},
							},
						},
					},
				};
			};
			const action = updateNewPostEmailSubscription( 1234, 'daily' );
			const actionWithRevert = merge( {}, action, {
				meta: {
					previousState: 'instantly',
				},
			} );
			requestUpdatePostEmailSubscription( { dispatch, getState }, action );

			expect( dispatch ).to.have.been.calledWith(
				http( {
					method: 'POST',
					path: '/read/site/1234/post_email_subscriptions/update',
					body: {
						delivery_frequency: 'daily',
					},
					apiVersion: '1.2',
					onSuccess: actionWithRevert,
					onFailure: actionWithRevert,
				} ),
			);
		} );
	} );

	describe( 'receiveUpdatePostEmailSubscription', () => {
		it( 'should do nothing on success', () => {
			const dispatch = spy();
			receiveUpdatePostEmailSubscription(
				{ dispatch },
				{
					payload: { blogId: 1234 },
					meta: { previousState: 'instantly' },
				},
				null,
				{ success: true },
			);
			expect( dispatch ).to.have.not.been.called;
		} );

		it( 'should dispatch an update with the previous state if it is called with null', () => {
			const dispatch = spy();
			const previousState = 'instantly';
			receiveUpdatePostEmailSubscription(
				{ dispatch },
				{
					payload: { blogId: 1234 },
					meta: { previousState },
				},
				null,
				null,
			);
			expect( dispatch ).to.have.been.calledWith(
				local( updateNewPostEmailSubscription( 1234, previousState ) ),
			);
		} );

		it( 'should dispatch an update with the previous state if it fails', () => {
			const dispatch = spy();
			const previousState = 'instantly';
			receiveUpdatePostEmailSubscription(
				{ dispatch },
				{
					payload: { blogId: 1234 },
					meta: { previousState },
				},
				null,
				{ success: false },
			);
			expect( dispatch ).to.have.been.calledWith(
				local( updateNewPostEmailSubscription( 1234, previousState ) ),
			);
		} );
	} );

	describe( 'receiveUpdatePostEmailSubscriptionError', () => {
		it( 'should dispatch an error and an update to the previous state', () => {
			const dispatch = spy();
			const previousState = 'instantly';
			receiveUpdatePostEmailSubscriptionError(
				{ dispatch },
				{
					payload: { blogId: 1234 },
					meta: { previousState },
				},
				null,
			);
			expect( dispatch ).to.have.been.calledWith(
				local( updateNewPostEmailSubscription( 1234, previousState ) ),
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: { text: 'Sorry, we had a problem updating that subscription. Please try again.' },
			} );
		} );
	} );
} );
