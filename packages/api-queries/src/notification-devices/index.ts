import {
	createNotificationsDevice,
	deleteNotificationsDevice,
	type NotificationsDeviceResponse,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { startBrowserSubscription, getPushNotificationState } from './browser';
export * from './type';

const deviceQueryKey = [ 'notifications', 'device' ];

/**
 * Get the notifications device query data.
 * It uses a local storage key to persist the data, no backend request is made.
 * This data is persisted by the query client after the creation of the notifications device is successful.
 * @returns
 */
export const notificationDeviceQuery = () =>
	queryOptions< NotificationsDeviceResponse | null, Error >( {
		queryKey: deviceQueryKey,
		queryFn: () => Promise.resolve( queryClient.getQueryData( deviceQueryKey ) ?? null ),
	} );

/**
 * Delete a notifications device.
 * This mutation will update the notifications device query data.
 * @returns
 */
export const notificationDeviceRemovalMutation = () =>
	mutationOptions( {
		mutationFn: ( deviceId: string ) => deleteNotificationsDevice( deviceId ),
		onMutate: () => {
			const previousData = queryClient.getQueryData( notificationDeviceQuery().queryKey );
			queryClient.setQueryData( notificationDeviceQuery().queryKey, null );

			return { previousData };
		},
		onSuccess: () => {
			queryClient.setQueryData( notificationDeviceQuery().queryKey, null );
		},
		onError: ( _, __, context ) => {
			// Revert the previous data
			queryClient.setQueryData( notificationDeviceQuery().queryKey, context?.previousData );
		},
	} );

export const notificationPushPermissionStateQuery = () => {
	return queryOptions( {
		queryKey: [ 'notifications', 'push-permission-state' ],
		queryFn: getPushNotificationState,
		meta: {
			persist: false,
		},
	} );
};

/**
 * Create a new notifications device based on the push subscription.
 * It automatically starts the browser subscription if needed.
 * This mutation will update the notifications device query data.
 * @returns
 */
export const notificationDeviceRegistrationMutation = () =>
	mutationOptions< NotificationsDeviceResponse, Error >( {
		mutationFn: async () => {
			const subscription = await startBrowserSubscription();

			return await createNotificationsDevice( {
				device_token: subscription,
				device_family: 'browser',
				device_name: 'Browser',
			} );
		},
		onSuccess: ( data ) => {
			queryClient.setQueryData( notificationDeviceQuery().queryKey, data );
		},
		onSettled: () => {
			// It invalidates the push permission state because when there is an error, the browser updates the permission state.
			// So we need to invalidate the query to get the up to date one.
			queryClient.invalidateQueries( {
				queryKey: notificationPushPermissionStateQuery().queryKey,
			} );
		},
	} );
