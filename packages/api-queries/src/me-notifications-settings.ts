import { fetchMeNotificationSettings, updateWpcomNotificationSettings } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const meNotificationsSettingsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'notifications', 'settings' ],
		queryFn: fetchMeNotificationSettings,
	} );

export const meNotificationsExtrasSettingsMutation = () =>
	mutationOptions( {
		mutationFn: updateWpcomNotificationSettings,
		onSuccess: ( newData ) => {
			const wpcomUpdate = ( newData as any )?.wpcom ?? newData;
			queryClient.setQueryData(
				meNotificationsSettingsQuery().queryKey,
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
