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
		meta: { statId: 'user-settings-update' },
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
		meta: { statId: 'email-change-cancel' },
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
		meta: { statId: 'email-verify-resend' },
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
