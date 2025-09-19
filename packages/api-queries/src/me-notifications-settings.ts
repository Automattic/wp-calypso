import {
	fetchUserNotificationSettings,
	updateUserNotificationSettings,
	updateWpcomNotificationSettings,
	UserNotificationSettings,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import deepmerge from 'deepmerge';
import { queryClient } from './query-client';

export const userNotificationsSettingsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'notifications', 'settings' ],
		queryFn: fetchUserNotificationSettings,
	} );

export const userNotificationsSettingsMutation = () =>
	mutationOptions( {
		mutationFn: updateUserNotificationSettings,
		mutationKey: [ 'me', 'notifications', 'settings' ],
		onMutate: async ( variables ) => {
			const oldData = queryClient.getQueryData( userNotificationsSettingsQuery().queryKey );

			queryClient.setQueryData(
				userNotificationsSettingsQuery().queryKey,
				deepmerge( oldData || {}, variables.data ) as UserNotificationSettings
			);
		},
		onSuccess: async ( newData ) => {
			const oldData = queryClient.getQueryData( userNotificationsSettingsQuery().queryKey );
			const updated = { ...deepmerge( oldData ?? {}, newData ) } as UserNotificationSettings;
			queryClient.setQueryData( userNotificationsSettingsQuery().queryKey, updated );

			return updated;
		},
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
