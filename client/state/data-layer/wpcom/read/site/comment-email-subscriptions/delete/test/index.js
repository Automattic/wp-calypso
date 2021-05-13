/**
 * External dependencies
 */
import { expect } from 'chai';

/**
 * Internal dependencies
 */
import {
	requestCommentEmailUnsubscription,
	receiveCommentEmailUnsubscription,
	receiveCommentEmailUnsubscriptionError,
} from '../';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	subscribeToNewCommentEmail,
	unsubscribeToNewCommentEmail,
} from 'calypso/state/reader/follows/actions';

describe( 'comment-email-subscriptions', () => {
	describe( 'requestCommentEmailUnsubscription', () => {
		test( 'should dispatch an http request and call through next', () => {
			const action = unsubscribeToNewCommentEmail( 1234 );
			const result = requestCommentEmailUnsubscription( action );
			expect( result ).to.eql(
				http(
					{
						method: 'POST',
						path: '/read/site/1234/comment_email_subscriptions/delete',
						body: {},
						apiVersion: '1.2',
					},
					action
				)
			);
		} );
	} );

	describe( 'receiveCommentEmailUnsubscription', () => {
		test( 'should do nothing if successful', () => {
			const result = receiveCommentEmailUnsubscription( null, { subscribed: false } );
			expect( result ).to.be.undefined;
		} );

		test( 'should  a subscribe if it fails using next', () => {
			const result = receiveCommentEmailUnsubscription(
				{ payload: { blogId: 1234 } },
				{ subscribed: true }
			);
			expect( result[ 0 ].notice.text ).to.eql(
				'Sorry, we had a problem unsubscribing. Please try again.'
			);
			expect( result[ 1 ] ).to.eql( bypassDataLayer( subscribeToNewCommentEmail( 1234 ) ) );
		} );
	} );

	describe( 'receiveCommentEmailUnsubscriptionError', () => {
		test( 'should dispatch an error notice and subscribe action through next', () => {
			const result = receiveCommentEmailUnsubscriptionError( { payload: { blogId: 1234 } } );
			expect( result[ 0 ].notice.text ).to.eql(
				'Sorry, we had a problem unsubscribing. Please try again.'
			);
			expect( result[ 1 ] ).to.eql( bypassDataLayer( subscribeToNewCommentEmail( 1234 ) ) );
		} );
	} );
} );
