/** @format */

/**
 * Internal dependencies
 */
import { requestNotificationSubscription } from '../';
//import { bypassDataLayer } from 'state/data-layer/utils';
import { http } from 'state/data-layer/wpcom-http/actions';
import { subscribeToNewPostNotifications } from 'state/reader/follows/actions';

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
} );
