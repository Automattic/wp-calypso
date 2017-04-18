/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal Dependencies
 */
import {
	requestCommentEmailSubscription,
	receiveCommentEmailSubscription,
	receiveCommentEmailSubscriptionError,
} from '../';
import {
	subscribeToNewCommentEmail,
	unsubscribeToNewCommentEmail
} from 'state/reader/follows/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'comment-email-subscriptions', () => {
	describe( 'requestCommentEmailSubscription', () => {
		it( 'should dispatch an http request and call through next', () => {
			const dispatch = spy();
			const next = spy();
			const action = subscribeToNewCommentEmail( 1234 );
			requestCommentEmailSubscription( { dispatch }, action, next );
			expect( dispatch ).to.have.been.calledWith( http( {
				method: 'POST',
				path: '/read/site/1234/comment_email_subscriptions/new',
				body: {},
				apiVersion: '1.2',
				onSuccess: action,
				onFailure: action
			} ) );

			expect( next ).to.have.been.calledWith( action );
		} );
	} );

	describe( 'receiveCommentEmailSubscription', () => {
		it( 'should do nothing if successful', () => {
			const nextSpy = spy();
			receiveCommentEmailSubscription(
				null,
				null,
				nextSpy,
				{ subscribed: true }
			);
			expect( nextSpy ).to.not.have.been.called;
		} );

		it( 'should dispatch an unsubscribe if it fails using next', () => {
			const nextSpy = spy();
			const dispatch = spy();
			receiveCommentEmailSubscription(
				{ dispatch },
				{ payload: { blogId: 1234 } },
				nextSpy,
				{ subscribed: false }
			);
			expect( nextSpy ).to.have.been.calledWith(
				unsubscribeToNewCommentEmail( 1234 )
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem subscribing. Please try again.'
				}
			} );
		} );
	} );

	describe( 'receiveCommentEmailSubscriptionError', () => {
		it( 'should dispatch an error notice and unsubscribe action using next', () => {
			const dispatch = spy();
			const nextSpy = spy();
			receiveCommentEmailSubscriptionError(
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
				unsubscribeToNewCommentEmail( 1234 )
			);
		} );
	} );
} );
