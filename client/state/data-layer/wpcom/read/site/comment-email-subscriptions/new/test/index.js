/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { requestCommentEmailSubscription, receiveCommentEmailSubscription, receiveCommentEmailSubscriptionError } from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { subscribeToNewCommentEmail, unsubscribeToNewCommentEmail } from 'state/reader/follows/actions';

describe( 'comment-email-subscriptions', () => {
	describe( 'requestCommentEmailSubscription', () => {
		it( 'should dispatch an http request and call through next', () => {
			const dispatch = spy();
			const action = subscribeToNewCommentEmail( 1234 );
			requestCommentEmailSubscription( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				http( {
					method: 'POST',
					path: '/read/site/1234/comment_email_subscriptions/new',
					body: {},
					apiVersion: '1.2',
					onSuccess: action,
					onFailure: action,
				} )
			);
		} );
	} );

	describe( 'receiveCommentEmailSubscription', () => {
		it( 'should do nothing if successful', () => {
			const dispatch = spy();
			receiveCommentEmailSubscription( { dispatch }, null, { subscribed: true } );
			expect( dispatch ).to.not.have.been.called;
		} );

		it( 'should dispatch an unsubscribe if it fails using next', () => {
			const dispatch = spy();
			receiveCommentEmailSubscription(
				{ dispatch },
				{ payload: { blogId: 1234 } },
				{
					subscribed: false,
				}
			);
			expect( dispatch ).to.have.been.calledWith(
				bypassDataLayer( unsubscribeToNewCommentEmail( 1234 ) )
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem subscribing. Please try again.',
				},
			} );
		} );
	} );

	describe( 'receiveCommentEmailSubscriptionError', () => {
		it( 'should dispatch an error notice and unsubscribe action using next', () => {
			const dispatch = spy();
			receiveCommentEmailSubscriptionError( { dispatch }, { payload: { blogId: 1234 } }, null );
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem subscribing. Please try again.',
				},
			} );
			expect( dispatch ).to.have.been.calledWith(
				bypassDataLayer( unsubscribeToNewCommentEmail( 1234 ) )
			);
		} );
	} );
} );
