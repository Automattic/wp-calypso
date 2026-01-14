import { fetchUserSettings, updateUserSettings } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient, clearQueryClient } from './query-client';

export const userSettingsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'settings' ],
		queryFn: fetchUserSettings,
	} );

export const userSettingsMutation = () =>
	mutationOptions( {
		mutationFn: updateUserSettings,
		onSuccess: ( newData, variables ) => {
			queryClient.setQueryData(
				userSettingsQuery().queryKey,
				( oldData ) =>
					oldData && {
						...oldData,
						...newData,
					}
			);

			if ( variables.language ) {
				clearQueryClient();
			}
		},
	} );

export const cancelPendingEmailChangeMutation = () =>
	mutationOptions( {
		mutationFn: () => updateUserSettings( { user_email_change_pending: false } ),
		onSuccess: ( newData ) => {
			queryClient.setQueryData(
				userSettingsQuery().queryKey,
				( oldData ) =>
					oldData && {
						...oldData,
						...newData,
					}
			);
		},
	} );

export const resendEmailVerificationMutation = ( email: string ) =>
	mutationOptions( {
		mutationFn: () => updateUserSettings( { user_email: email } ),
		onSuccess: ( newData ) => {
			queryClient.setQueryData(
				userSettingsQuery().queryKey,
				( oldData ) =>
					oldData && {
						...oldData,
						...newData,
					}
			);
		},
	} );
