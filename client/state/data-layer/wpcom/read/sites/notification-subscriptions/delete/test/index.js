/**
 * Internal dependencies
 */
import {
	requestNotificationUnsubscription,
	receiveNotificationUnsubscriptionError,
	fromApi,
} from '../';
import { bypassDataLayer } from 'calypso/state/data-layer/utils';
import { http } from 'calypso/state/data-layer/wpcom-http/actions';
import {
	subscribeToNewPostNotifications,
	unsubscribeToNewPostNotifications,
} from 'calypso/state/reader/follows/actions';
import { NOTICE_CREATE } from 'calypso/state/action-types';

describe( 'notification-subscriptions-delete', () => {
	describe( 'requestNotificationUnsubscription', () => {
		test( 'should dispatch an http request', () => {
			const blogId = 123;
			const action = unsubscribeToNewPostNotifications( blogId );

			expect( requestNotificationUnsubscription( action ) ).toEqual(
				http(
					{
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						path: `/read/sites/${ blogId }/notification-subscriptions/delete`,
						body: {},
					},
					action
				)
			);
		} );
	} );

	describe( 'fromApi', () => {
		test( 'should throw an error when the unsubscription fails', () => {
			const response = {
				subscribed: true,
				success: false,
			};

			expect( () => {
				fromApi( response );
			} ).toThrow();
		} );

		test( 'should return response unchanged if response indicates a success', () => {
			const response = Object.freeze( {
				success: true,
				subscribed: false,
			} );

			expect( fromApi( response ) ).toEqual( response );
		} );
	} );

	describe( 'receiveNotificationUnsubscriptionError', () => {
		test( 'should return an error notice and revert the unsubscription', () => {
			const blogId = 123;
			const action = unsubscribeToNewPostNotifications( blogId );

			const output = receiveNotificationUnsubscriptionError( action );
			expect( output[ 0 ] ).toMatchObject( {
				type: NOTICE_CREATE,
				notice: { status: 'is-error' },
			} );
			expect( output[ 1 ] ).toEqual( bypassDataLayer( subscribeToNewPostNotifications( blogId ) ) );
		} );
	} );
} );
