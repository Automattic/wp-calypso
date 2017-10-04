/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { requestCommentEmailUnsubscription, receiveCommentEmailUnsubscription, receiveCommentEmailUnsubscriptionError } from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { subscribeToNewCommentEmail, unsubscribeToNewCommentEmail } from 'state/reader/follows/actions';

describe( 'comment-email-subscriptions', () => {
	describe( 'requestCommentEmailUnsubscription', () => {
		it( 'should dispatch an http request and call through next', () => {
			const dispatch = spy();
			const action = unsubscribeToNewCommentEmail( 1234 );
			requestCommentEmailUnsubscription( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				http( {
					method: 'POST',
					path: '/read/site/1234/comment_email_subscriptions/delete',
					body: {},
					apiVersion: '1.2',
					onSuccess: action,
					onFailure: action,
				} )
			);
		} );
	} );

	describe( 'receiveCommentEmailUnsubscription', () => {
		it( 'should do nothing if successful', () => {
			const dispatch = spy();

			receiveCommentEmailUnsubscription( { dispatch }, null, { subscribed: false } );
			expect( dispatch ).to.not.have.been.called;
		} );

		it( 'should dispatch a subscribe if it fails using next', () => {
			const dispatch = spy();
			receiveCommentEmailUnsubscription(
				{ dispatch },
				{ payload: { blogId: 1234 } },
				{
					subscribed: true,
				}
			);
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem unsubscribing. Please try again.',
				},
			} );
			expect( dispatch ).to.have.been.calledWith(
				bypassDataLayer( subscribeToNewCommentEmail( 1234 ) )
			);
		} );
	} );

	describe( 'receiveCommentEmailUnsubscriptionError', () => {
		it( 'should dispatch an error notice and subscribe action through next', () => {
			const dispatch = spy();
			receiveCommentEmailUnsubscriptionError( { dispatch }, { payload: { blogId: 1234 } } );
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem unsubscribing. Please try again.',
				},
			} );
			expect( dispatch ).to.have.been.calledWith(
				bypassDataLayer( subscribeToNewCommentEmail( 1234 ) )
			);
		} );
	} );
} );
