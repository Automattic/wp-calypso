import { fetchUserSettings, sendVerificationEmail, updateUserSettings } from '@automattic/api-core';
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

// Re-saves the address already pending, which is what prompts another email.
//
// The response isn't written back. It describes the state as it was when the request was sent,
// and this can overlap a cancellation from either of the two controls that offer one — so it may
// reinstate a change already cancelled, or miss one this request has itself recreated. The
// settings are refetched instead of guessed, whichever way the two landed.
export const resendEmailVerificationMutation = () =>
	mutationOptions( {
		meta: { statId: 'email-verify-resend' },
		// The address is a variable rather than closed over, so a caller can tell which request a
		// late response belongs to.
		mutationFn: ( email: string ) => updateUserSettings( { user_email: email } ),
		onSuccess: () => {
			void queryClient.invalidateQueries( { queryKey: userSettingsQuery().queryKey } );
		},
	} );

export const sendEmailVerificationMutation = () =>
	mutationOptions( {
		meta: { statId: 'email-verify-send' },
		mutationFn: () => sendVerificationEmail(),
	} );
