/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { merge } from 'lodash';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { requestUpdatePostEmailSubscription, receiveUpdatePostEmailSubscription, receiveUpdatePostEmailSubscriptionError } from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { updateNewPostEmailSubscription } from 'state/reader/follows/actions';

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
				} )
			);
		} );
	} );

	describe( 'receiveUpdatePostEmailSubscription', () => {
		it( 'should dispatch an update with the previous state if it is called with null', () => {
			const dispatch = spy();
			const previousState = 'instantly';
			receiveUpdatePostEmailSubscription(
				{ dispatch },
				{
					payload: { blogId: 1234 },
					meta: { previousState },
				},
				null
			);
			expect( dispatch ).to.have.been.calledWith(
				bypassDataLayer( updateNewPostEmailSubscription( 1234, previousState ) )
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
				{ success: false }
			);
			expect( dispatch ).to.have.been.calledWith(
				bypassDataLayer( updateNewPostEmailSubscription( 1234, previousState ) )
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
				}
			);
			expect( dispatch ).to.have.been.calledWith(
				bypassDataLayer( updateNewPostEmailSubscription( 1234, previousState ) )
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: { text: 'Sorry, we had a problem updating that subscription. Please try again.' },
			} );
		} );
	} );
} );
