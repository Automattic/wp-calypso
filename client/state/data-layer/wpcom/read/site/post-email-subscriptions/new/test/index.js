/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal Dependencies
 */
import {
	requestPostEmailSubscription,
	receivePostEmailSubscription,
	receivePostEmailSubscriptionError,
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
		it( 'should dispatch an error notice and unsubscribe action using next', () => {
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
} );
