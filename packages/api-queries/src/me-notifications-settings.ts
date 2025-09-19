import {
	fetchUserNotificationSettings,
	updateWpcomNotificationSettings,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const userNotificationsSettingsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'notifications', 'settings' ],
		queryFn: fetchUserNotificationSettings,
	} );

export const userNotificationsExtrasSettingsMutation = () =>
	mutationOptions( {
		mutationFn: updateWpcomNotificationSettings,
		onSuccess: ( newData ) => {
			const wpcomUpdate = ( newData as any )?.wpcom ?? newData;
			queryClient.setQueryData(
				userNotificationsSettingsQuery().queryKey,
				( oldData: any ) =>
					oldData && {
						...oldData,
						wpcom: {
							...oldData.wpcom,
							...wpcomUpdate,
						},
					}
			);
		},
	} );
