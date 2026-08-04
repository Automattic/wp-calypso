import { fetchUserSettings, sendVerificationEmail, updateUserSettings } from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient, clearQueryClient } from './query-client';

export const userSettingsQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'settings' ],
		queryFn: fetchUserSettings,
	} );

// Resending re-saves the address already pending, so it is a write like the others. Two landing
// out of order can leave the account holding a change the reader cancelled: the scope keeps them
// to one at a time, the key lets a control tell when any is running.
const emailWriteOptions = {
	mutationKey: [ 'me', 'settings', 'email' ],
	scope: { id: 'me-email' },
};

export const emailWriteFilters = { mutationKey: emailWriteOptions.mutationKey };

// `includesEmail` opts a save into the ordering above; callers saving unrelated settings should
// not queue behind an email resend.
export const userSettingsMutation = ( {
	includesEmail = false,
}: { includesEmail?: boolean } = {} ) =>
	mutationOptions( {
		meta: { statId: 'user-settings-update' },
		...( includesEmail ? emailWriteOptions : {} ),
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
		...emailWriteOptions,
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
// Deliberately leaves the cache alone. It changes nothing, and its response is a whole settings
// object: merging one that was read before an unrelated save would put the older values back.
export const resendEmailVerificationMutation = () =>
	mutationOptions( {
		meta: { statId: 'email-verify-resend' },
		...emailWriteOptions,
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
