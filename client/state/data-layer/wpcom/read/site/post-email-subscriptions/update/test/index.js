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
import {
	updateNewPostEmailSubscription,
} from 'state/reader/follows/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'comment-email-subscriptions', () => {
	describe( 'requestUpdatePostEmailSubscription', () => {
		it( 'should dispatch an http request with revert info on the success and failure actions', () => {
			const dispatch = spy();
			const nextSpy = spy();
			const getState = () => {
				return {
					reader: {
						follows: {
							items: {
								foo: {
									blog_ID: 1234,
									delivery_frequency: {
										email: {
											post_delivery_frequency: 'instantly'
										}
									}
								}
							}
						}
					}
				};
			};
			const action = updateNewPostEmailSubscription( 1234, 'daily' );
			const actionWithRevert = merge( {}, action, {
				meta: {
					previousState: 'instantly'
				}
			} );
			requestUpdatePostEmailSubscription(
				{ dispatch, getState },
				action,
				nextSpy
			);

			expect( dispatch ).to.have.been.calledWith( http( {
				method: 'POST',
				path: '/read/site/1234/post_email_subscriptions/update',
				body: {
					delivery_frequency: 'daily'
				},
				apiVersion: '1.2',
				onSuccess: actionWithRevert,
				onFailure: actionWithRevert
			} ) );
		} );
	} );

	describe( 'receiveUpdatePostEmailSubscription', () => {
		it( 'should do nothing on success', () => {
			const dispatch = spy();
			const next = spy();
			receiveUpdatePostEmailSubscription(
				{ dispatch },
				{
					payload: { blogId: 1234 },
					meta: { previousState: 'instantly' }
				},
				next,
				{ success: true }
			);
			expect( dispatch ).to.have.not.been.called;
			expect( next ).to.have.not.been.called;
		} );

		it( 'should dispatch an update with the previous state if it is called with null', () => {
			const dispatch = spy();
			const next = spy();
			const previousState = 'instantly';
			receiveUpdatePostEmailSubscription(
				{ dispatch },
				{
					payload: { blogId: 1234 },
					meta: { previousState }
				},
				next,
				null
			);
			expect( next ).to.have.been.calledWith(
				updateNewPostEmailSubscription( 1234, previousState )
			);
		} );

		it( 'should dispatch an update with the previous state if it fails', () => {
			const dispatch = spy();
			const next = spy();
			const previousState = 'instantly';
			receiveUpdatePostEmailSubscription(
				{ dispatch },
				{
					payload: { blogId: 1234 },
					meta: { previousState }
				},
				next,
				{ success: false }
			);
			expect( next ).to.have.been.calledWith(
				updateNewPostEmailSubscription( 1234, previousState )
			);
		} );
	} );

	describe( 'receiveUpdatePostEmailSubscriptionError', () => {
		it( 'should dispatch an error and an update to the previous state', () => {
			const dispatch = spy();
			const next = spy();
			const previousState = 'instantly';
			receiveUpdatePostEmailSubscriptionError(
				{ dispatch },
				{
					payload: { blogId: 1234 },
					meta: { previousState }
				},
				next
			);
			expect( next ).to.have.been.calledWith(
				updateNewPostEmailSubscription( 1234, previousState )
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: { text: 'Sorry, we had a problem updating that subscription. Please try again.' }
			} );
		} );
	} );
} );
