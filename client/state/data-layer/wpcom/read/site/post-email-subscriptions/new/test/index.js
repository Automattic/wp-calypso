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
import { local } from 'state/data-layer/utils';

describe( 'comment-email-subscriptions', () => {
	describe( 'requestPostEmailSubscription', () => {
		it( 'should dispatch an http request and call through next', () => {
			const dispatch = spy();
			const action = subscribeToNewPostEmail( 1234 );
			requestPostEmailSubscription( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				http( {
					method: 'POST',
					path: '/read/site/1234/post_email_subscriptions/new',
					body: {},
					apiVersion: '1.2',
					onSuccess: action,
					onFailure: action,
				} ),
			);
		} );
	} );

	describe( 'receivePostEmailSubscription', () => {
		it( 'should call next to update the subscription with the delivery frequency from the response', () => {
			const dispatch = spy();
			receivePostEmailSubscription( { dispatch }, subscribeToNewPostEmail( 1234 ), null, {
				subscribed: true,
				subscription: {
					delivery_frequency: 'daily',
				},
			} );
			expect( dispatch ).to.have.been.calledWith(
				local( updateNewPostEmailSubscription( 1234, 'daily' ) ),
			);
		} );

		it( 'should dispatch an unsubscribe if it fails using next', () => {
			const dispatch = spy();
			receivePostEmailSubscription( { dispatch }, { payload: { blogId: 1234 } }, null, {
				subscribed: false,
			} );
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem subscribing. Please try again.',
				},
			} );
			expect( dispatch ).to.have.been.calledWith( local( unsubscribeToNewPostEmail( 1234 ) ) );
		} );
	} );

	describe( 'receivePostEmailSubscriptionError', () => {
		it( 'should dispatch an error notice and unsubscribe action using next', () => {
			const dispatch = spy();
			receivePostEmailSubscriptionError( { dispatch }, { payload: { blogId: 1234 } }, null );
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem subscribing. Please try again.',
				},
			} );
			expect( dispatch ).to.have.been.calledWith( local( unsubscribeToNewPostEmail( 1234 ) ) );
		} );
	} );
} );
