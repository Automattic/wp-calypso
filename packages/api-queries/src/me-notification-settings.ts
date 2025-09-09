import { fetchNotificationSettings } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const notificationSettingsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'notification-settings' ],
		queryFn: fetchNotificationSettings,
	} );
