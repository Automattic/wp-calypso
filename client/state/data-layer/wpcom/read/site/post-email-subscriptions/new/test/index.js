/**
 * External dependencies
 */
import {
	requestPostEmailSubscription,
	receivePostEmailSubscription,
	receivePostEmailSubscriptionError,
} from '../';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	subscribeToNewPostEmail,
	unsubscribeToNewPostEmail,
	updateNewPostEmailSubscription,
} from 'calypso/state/reader/follows/actions';

describe( 'comment-email-subscriptions', () => {
	describe( 'requestPostEmailSubscription', () => {
		test( 'should dispatch an http request and call through next', () => {
			const action = subscribeToNewPostEmail( 1234 );
			const result = requestPostEmailSubscription( action );
			expect( result ).toEqual(
				http( {
					method: 'POST',
					path: '/read/site/1234/post_email_subscriptions/new',
					body: {},
					apiVersion: '1.2',
					onSuccess: action,
					onFailure: action,
				} )
			);
		} );
	} );

	describe( 'receivePostEmailSubscription', () => {
		test( 'should call next to update the subscription with the delivery frequency from the response', () => {
			const result = receivePostEmailSubscription( subscribeToNewPostEmail( 1234 ), {
				subscribed: true,
				subscription: {
					delivery_frequency: 'daily',
				},
			} );
			expect( result ).toEqual(
				bypassDataLayer( updateNewPostEmailSubscription( 1234, 'daily' ) )
			);
		} );

		test( 'should dispatch an unsubscribe if it fails using next', () => {
			const result = receivePostEmailSubscription(
				{ payload: { blogId: 1234 } },
				{ subscribed: false }
			);
			expect( result[ 0 ].notice.text ).toBe(
				'Sorry, we had a problem subscribing. Please try again.'
			);
			expect( result[ 1 ] ).toEqual( bypassDataLayer( unsubscribeToNewPostEmail( 1234 ) ) );
		} );
	} );

	describe( 'receivePostEmailSubscriptionError', () => {
		test( 'should dispatch an error notice and unsubscribe action using next', () => {
			const result = receivePostEmailSubscriptionError( { payload: { blogId: 1234 } }, null );
			expect( result[ 0 ].notice.text ).toBe(
				'Sorry, we had a problem subscribing. Please try again.'
			);
			expect( result[ 1 ] ).toEqual( bypassDataLayer( unsubscribeToNewPostEmail( 1234 ) ) );
		} );
	} );
} );
