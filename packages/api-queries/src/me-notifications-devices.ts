import { fetchUserNotificationDevices } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const userNotificationsDevicesQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'notifications', 'devices' ],
		queryFn: fetchUserNotificationDevices,
		staleTime: 1000 * 60 * 5,
	} );
