/** @format */

/**
 * Internal dependencies
 */
import {
	requestNotificationSubscription,
	receiveNotificationSubscriptionError,
	fromApi,
} from '../';
import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import {
	subscribeToNewPostNotifications,
	unsubscribeToNewPostNotifications,
} from 'state/reader/follows/actions';
import { NOTICE_CREATE } from 'state/action-types';

describe( 'notification-subscriptions-new', () => {
	describe( 'requestNotificationSubscription', () => {
		test( 'should dispatch an http request', () => {
			const blogId = 123;
			const action = subscribeToNewPostNotifications( blogId );

			expect( requestNotificationSubscription( action ) ).toEqual(
				http(
					{
						apiNamespace: 'wpcom/v2',
						method: 'POST',
						path: `/read/sites/${ blogId }/notification-subscriptions/new`,
					},
					action
				)
			);
		} );
	} );

	describe( 'fromApi', () => {
		test( 'should throw an error when success is false', () => {
			const response = {
				success: false,
			};

			expect( () => {
				fromApi( response );
			} ).toThrow();
		} );

		test( 'should return response unchanged if response indicates a success', () => {
			const response = Object.freeze( {
				success: true,
			} );

			expect( fromApi( response ) ).toEqual( response );
		} );
	} );

	describe( 'receiveNotificationSubscriptionError', () => {
		test( 'should return an error notice and revert the subscription', () => {
			const blogId = 123;
			const action = subscribeToNewPostNotifications( blogId );

			const output = receiveNotificationSubscriptionError( action );
			expect( output[ 0 ] ).toMatchObject( {
				type: NOTICE_CREATE,
				notice: { status: 'is-error' },
			} );
			expect( output[ 1 ] ).toEqual(
				bypassDataLayer( unsubscribeToNewPostNotifications( blogId ) )
			);
		} );
	} );
} );
