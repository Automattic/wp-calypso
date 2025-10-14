import {
	fetchUserNotificationSettings,
	InputUserNotificationSettings,
	updateUserNotificationSettings,
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

export interface Variables {
	data: InputUserNotificationSettings;
	applyToAll?: boolean;
}

export const userNotificationsSettingsMutation = () =>
	mutationOptions< UserNotificationSettings, Error, Variables >( {
		mutationFn: ( newData: Variables ) =>
			updateUserNotificationSettings( newData.data, newData.applyToAll ),
		mutationKey: [ 'me', 'notifications', 'settings' ],
		onMutate: async ( variables ) => {
			const previousData = queryClient.getQueryData( userNotificationsSettingsQuery().queryKey );
			if ( ! previousData ) {
				return { previousData };
			}

			queryClient.setQueryData(
				userNotificationsSettingsQuery().queryKey,
				mergeSettings( previousData ?? {}, variables.data )
			);
			return { previousData };
		},
		onSuccess: ( newData ) => {
			queryClient.setQueryData( userNotificationsSettingsQuery().queryKey, newData );
		},
		onError: ( _, __, context ) => {
			const { previousData } = context as { previousData: UserNotificationSettings };
			if ( previousData ) {
				queryClient.setQueryData( userNotificationsSettingsQuery().queryKey, previousData );
			}
		},
	} );
