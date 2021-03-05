/**
 * External dependencies
 */

/**
 * Internal dependencies
 */
import {
	requestPostEmailUnsubscription,
	receivePostEmailUnsubscription,
	receivePostEmailUnsubscriptionError,
} from '../';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	subscribeToNewPostEmail,
	unsubscribeToNewPostEmail,
} from 'calypso/state/reader/follows/actions';

describe( 'comment-email-subscriptions', () => {
	describe( 'requestPostEmailUnsubscription', () => {
		test( 'should dispatch an http request and call through next', () => {
			const action = unsubscribeToNewPostEmail( 1234 );
			const result = requestPostEmailUnsubscription( action );
			expect( result ).toEqual(
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
		test( 'should do nothing if successful', () => {
			const result = receivePostEmailUnsubscription( null, { subscribed: false } );
			expect( result ).toBeUndefined();
		} );

		test( 'should dispatch a subscribe if it fails using next', () => {
			const result = receivePostEmailUnsubscription(
				{ payload: { blogId: 1234 } },
				{
					subscribed: true,
				}
			);

			expect( result[ 0 ].notice.text ).toBe(
				'Sorry, we had a problem unsubscribing. Please try again.'
			);
			expect( result[ 1 ] ).toEqual( bypassDataLayer( subscribeToNewPostEmail( 1234 ) ) );
		} );
	} );

	describe( 'receivePostEmailUnsubscriptionError', () => {
		test( 'should dispatch an error notice and subscribe action using next', () => {
			const result = receivePostEmailUnsubscriptionError( { payload: { blogId: 1234 } }, null );
			expect( result[ 0 ].notice.text ).toBe(
				'Sorry, we had a problem unsubscribing. Please try again.'
			);
			expect( result[ 1 ] ).toEqual( bypassDataLayer( subscribeToNewPostEmail( 1234 ) ) );
		} );
	} );
} );
