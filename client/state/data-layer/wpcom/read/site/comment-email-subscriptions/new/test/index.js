/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	requestCommentEmailSubscription,
	receiveCommentEmailSubscription,
	receiveCommentEmailSubscriptionError,
} from '../';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	subscribeToNewCommentEmail,
	unsubscribeToNewCommentEmail,
} from 'calypso/state/reader/follows/actions';

describe( 'comment-email-subscriptions', () => {
	describe( 'requestCommentEmailSubscription', () => {
		test( 'should dispatch an http request and call through next', () => {
			const action = subscribeToNewCommentEmail( 1234 );
			const result = requestCommentEmailSubscription( action );
			expect( result ).to.eql(
				http(
					{
						method: 'POST',
						path: '/read/site/1234/comment_email_subscriptions/new',
						body: {},
						apiVersion: '1.2',
					},
					action
				)
			);
		} );
	} );

	describe( 'receiveCommentEmailSubscription', () => {
		test( 'should do nothing if successful', () => {
			const result = receiveCommentEmailSubscription( null, { subscribed: true } );
			expect( result ).to.be.undefined;
		} );

		test( 'should dispatch an unsubscribe if it fails using next', () => {
			const result = receiveCommentEmailSubscription(
				{ payload: { blogId: 1234 } },
				{ subscribed: false }
			);
			expect( result[ 0 ].notice.text ).to.eql(
				'Sorry, we had a problem subscribing. Please try again.'
			);
			expect( result[ 1 ] ).to.eql( bypassDataLayer( unsubscribeToNewCommentEmail( 1234 ) ) );
		} );
	} );

	describe( 'receiveCommentEmailSubscriptionError', () => {
		test( 'should dispatch an error notice and unsubscribe action using next', () => {
			const result = receiveCommentEmailSubscriptionError( { payload: { blogId: 1234 } }, null );
			expect( result[ 0 ].notice.text ).to.eql(
				'Sorry, we had a problem subscribing. Please try again.'
			);
			expect( result[ 1 ] ).to.eql( bypassDataLayer( unsubscribeToNewCommentEmail( 1234 ) ) );
		} );
	} );
} );
