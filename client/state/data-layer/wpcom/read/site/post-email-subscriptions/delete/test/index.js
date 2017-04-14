/**
 * External Dependencies
 */
import { expect } from 'chai';
import { spy } from 'sinon';

/**
 * Internal Dependencies
 */
import {
	requestPostEmailUnsubscription,
	receivePostEmailUnsubscription,
	receivePostEmailUnsubscriptionError,
} from '../';
import {
	subscribeToNewPostEmail,
	unsubscribeToNewPostEmail,
} from 'state/reader/follows/actions';
import { http } from 'state/data-layer/wpcom-http/actions';

describe( 'comment-email-subscriptions', () => {
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
		it( 'should dispatch an error notice and subscribe action using next', () => {
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
} );
