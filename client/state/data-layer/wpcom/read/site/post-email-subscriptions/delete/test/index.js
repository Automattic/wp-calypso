/** @format */
/**
 * External dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal dependencies
 */
import { requestPostEmailUnsubscription, receivePostEmailUnsubscription, receivePostEmailUnsubscriptionError } from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { subscribeToNewPostEmail, unsubscribeToNewPostEmail } from 'state/reader/follows/actions';

describe( 'comment-email-subscriptions', () => {
	describe( 'requestPostEmailUnsubscription', () => {
		it( 'should dispatch an http request and call through next', () => {
			const dispatch = spy();
			const action = unsubscribeToNewPostEmail( 1234 );
			requestPostEmailUnsubscription( { dispatch }, action );
			expect( dispatch ).to.have.been.calledWith(
				http( {
					method: 'POST',
					path: '/read/site/1234/post_email_subscriptions/delete',
					body: {},
					apiVersion: '1.2',
					onSuccess: action,
					onFailure: action,
				} )
			);
		} );
	} );

	describe( 'receivePostEmailUnsubscription', () => {
		it( 'should do nothing if successful', () => {
			const dispatch = spy();
			receivePostEmailUnsubscription( { dispatch }, null, { subscribed: false } );
			expect( dispatch ).to.not.have.been.called;
		} );

		it( 'should dispatch a subscribe if it fails using next', () => {
			const dispatch = spy();
			receivePostEmailUnsubscription(
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
				bypassDataLayer( subscribeToNewPostEmail( 1234 ) )
			);
		} );
	} );

	describe( 'receivePostEmailUnsubscriptionError', () => {
		it( 'should dispatch an error notice and subscribe action using next', () => {
			const dispatch = spy();
			receivePostEmailUnsubscriptionError( { dispatch }, { payload: { blogId: 1234 } }, null );
			expect( dispatch ).to.have.been.calledWithMatch( {
				notice: {
					text: 'Sorry, we had a problem unsubscribing. Please try again.',
				},
			} );
			expect( dispatch ).to.have.been.calledWith(
				bypassDataLayer( subscribeToNewPostEmail( 1234 ) )
			);
		} );
	} );
} );
