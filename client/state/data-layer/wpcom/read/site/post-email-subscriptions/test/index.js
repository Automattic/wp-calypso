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
	requestPostEmailSubscription,
	receivePostEmailSubscription,
	receivePostEmailSubscriptionError,
	requestPostEmailUnsubscription,
	receivePostEmailUnsubscription,
	receivePostEmailUnsubscriptionError,
	requestUpdatePostEmailSubscription,
	receiveUpdatePostEmailSubscription,
	receiveUpdatePostEmailSubscriptionError,
} from '../';
import {
	subscribeToNewPostEmail,
	unsubscribeToNewPostEmail,
	updateNewPostEmailSubscription,
} from 'state/reader/follows/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'comment-email-subscriptions', () => {
	describe( 'requestPostEmailSubscription', () => {
		it( 'should dispatch an http request and call through next', () => {
			const dispatch = spy();
			const next = spy();
			const action = subscribeToNewPostEmail( 1234 );
			requestPostEmailSubscription( { dispatch }, action, next );
			expect( dispatch ).to.have.been.calledWith( http( {
				method: 'POST',
				path: '/read/site/1234/post_email_subscriptions/new',
				body: {},
				apiVersion: '1.2',
				onSuccess: action,
				onFailure: action
			} ) );

			expect( next ).to.have.been.calledWith( action );
		} );
	} );

	describe( 'receivePostEmailSubscription', () => {
		it( 'should call next to update the subscription with the delivery frequency from the response', () => {
			const nextSpy = spy();
			receivePostEmailSubscription(
				null,
				subscribeToNewPostEmail( 1234 ),
				nextSpy,
				{
					subscribed: true,
					subscription: {
						delivery_frequency: 'daily'
					}
				}
			);
			expect( nextSpy ).to.have.been.calledWith(
				updateNewPostEmailSubscription( 1234, 'daily' )
			);
		} );

		it( 'should dispatch an unsubscribe if it fails using next', () => {
			const nextSpy = spy();
			const dispatch = spy();
			receivePostEmailSubscription(
				{ dispatch },
				{ payload: { blogId: 1234 } },
				nextSpy,
				{ subscribed: false }
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem subscribing. Please try again.'
				}
			} );
			expect( nextSpy ).to.have.been.calledWith(
				unsubscribeToNewPostEmail( 1234 )
			);
		} );
	} );

	describe( 'receivePostEmailSubscriptionError', () => {
		it( 'should dispatch an error notice and unsubscribe action', () => {
			const dispatch = spy();
			const nextSpy = spy();
			receivePostEmailSubscriptionError(
				{ dispatch },
				{ payload: { blogId: 1234 } },
				nextSpy
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem subscribing. Please try again.'
				}
			} );
			expect( nextSpy ).to.have.been.calledWith(
				unsubscribeToNewPostEmail( 1234 )
			);
		} );
	} );

	describe( 'requestPostEmailUnsubscription', () => {
		it( 'should dispatch an http request and call through next', () => {
			const dispatch = spy();
			const next = spy();
			const action = unsubscribeToNewPostEmail( 1234 );
			requestPostEmailUnsubscription( { dispatch }, action, next );
			expect( dispatch ).to.have.been.calledWith( http( {
				method: 'POST',
				path: '/read/site/1234/post_email_subscriptions/delete',
				body: {},
				apiVersion: '1.2',
				onSuccess: action,
				onFailure: action
			} ) );

			expect( next ).to.have.been.calledWith( action );
		} );
	} );

	describe( 'receivePostEmailUnsubscription', () => {
		it( 'should do nothing if successful', () => {
			const nextSpy = spy();
			receivePostEmailUnsubscription(
				null,
				null,
				nextSpy,
				{ subscribed: false }
			);
			expect( nextSpy ).to.not.have.been.called;
		} );

		it( 'should dispatch a subscribe if it fails using next', () => {
			const nextSpy = spy();
			const dispatch = spy();
			receivePostEmailUnsubscription(
				{ dispatch },
				{ payload: { blogId: 1234 } },
				nextSpy,
				{ subscribed: true }
			);

			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem unsubscribing. Please try again.'
				}
			} );
			expect( nextSpy ).to.have.been.calledWith(
				subscribeToNewPostEmail( 1234 )
			);
		} );
	} );

	describe( 'receivePostEmailUnsubscriptionError', () => {
		it( 'should dispatch an error notice and subscribe action', () => {
			const dispatch = spy();
			const nextSpy = spy();
			receivePostEmailUnsubscriptionError(
				{ dispatch },
				{ payload: { blogId: 1234 } },
				nextSpy
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem unsubscribing. Please try again.'
				}
			} );
			expect( nextSpy ).to.have.been.calledWith(
				subscribeToNewPostEmail( 1234 )
			);
		} );
	} );

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
