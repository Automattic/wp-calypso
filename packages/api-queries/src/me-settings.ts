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
// Deliberately leaves the settings cache alone. It changes nothing, and both writing the response
// back and refetching can lose a race with a cancellation — either reinstating a change already
// cancelled, or reading the settings before it lands and overwriting them afterwards.
export const resendEmailVerificationMutation = () =>
	mutationOptions( {
		meta: { statId: 'email-verify-resend' },
		// The address is a variable rather than closed over, so a caller can tell which request a
		// late response belongs to.
		mutationFn: ( email: string ) => updateUserSettings( { user_email: email } ),
	} );

export const sendEmailVerificationMutation = () =>
	mutationOptions( {
		meta: { statId: 'email-verify-send' },
		// A refused send answers 200 with `success: false`. Rejected here so every caller doesn't
		// have to know that, and so a success snackbar can't announce an email nobody was sent.
		mutationFn: async () => {
			const response = await sendVerificationEmail();
			if ( ! response.success ) {
				throw new Error( 'unsuccessful_response' );
			}
			return response;
		},
	} );
