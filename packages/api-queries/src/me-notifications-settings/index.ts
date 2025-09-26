import {
	fetchUserNotificationSettings,
	InputUserNotificationSettings,
	updateUserNotificationSettings,
	updateWpcomNotificationSettings,
	UserNotificationSettings,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from '../query-client';
import { mergeSettings } from './helper';

export const userNotificationsSettingsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'notifications', 'settings' ],
		queryFn: fetchUserNotificationSettings,
	} );

interface Variables {
	data: InputUserNotificationSettings;
	applyAll?: boolean;
}

export const userNotificationsSettingsMutation = () =>
	mutationOptions< UserNotificationSettings, Error, Variables >( {
		mutationFn: ( newData: Variables ) =>
			updateUserNotificationSettings( newData.data, newData.applyAll ),
		mutationKey: [ 'me', 'notifications', 'settings' ],
		onMutate: async ( variables ) => {
			const oldData = queryClient.getQueryData( userNotificationsSettingsQuery().queryKey );
			if ( ! oldData ) {
				return;
			}

			queryClient.setQueryData(
				userNotificationsSettingsQuery().queryKey,
				mergeSettings( oldData, variables.data )
			);
			return { previousSettings: oldData };
		},
		onError: ( _, __, context ) => {
			const previousSettings = ( context as { previousSettings: UserNotificationSettings } )
				.previousSettings;
			if ( previousSettings ) {
				queryClient.setQueryData( userNotificationsSettingsQuery().queryKey, previousSettings );
			}
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
