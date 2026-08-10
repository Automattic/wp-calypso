import { userEmailSettingsMutation, userSettingsQuery } from '@automattic/api-queries';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslate } from 'i18n-calypso';
import { useState } from 'react';
import { RESEND_MIN_INTERVAL_SECONDS } from 'calypso/dashboard/utils/email-verification-resend';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { markResendUnavailableUntil } from './email-verification/storage';
import { ACTIVATION_EMAIL_SOURCE } from './use-email-verification-gate';

/**
 * Asks for a corrected address on the account the gate is holding, for a user who mistyped theirs.
 *
 * The address does not move here. The server mails a confirmation to the new one, and opening it
 * both makes the change and verifies the account — which is what returns the user to the flow. So
 * this reports success once the request is accepted, and the gate goes on waiting, now naming the
 * address the confirmation went to.
 */
export function useUpdateEmail( { flow, scope }: { flow: string; scope: string } ) {
	const translate = useTranslate();
	// Stepper's own, which is not the one the mutation writes its result into, so the settings
	// have to be asked for again rather than merged.
	const queryClient = useQueryClient();
	const [ error, setError ] = useState< string | null >( null );
	const { mutateAsync } = useMutation( userEmailSettingsMutation() );

	const updateEmail = async ( email: string ) => {
		setError( null );

		try {
			await mutateAsync( {
				user_email: email,
				// Recorded against the pending change, so confirming it returns here rather than
				// landing on account settings.
				user_email_change_requested_from: ACTIVATION_EMAIL_SOURCE,
			} );
		} catch ( failure ) {
			const message = failure instanceof Error ? failure.message : String( failure );
			// The server names what it refused better than this can — an address already taken,
			// or one it will not accept.
			setError( message || translate( 'Something went wrong. Please try again.' ) );
			recordTracksEvent( 'calypso_signup_email_verification_email_update_failed', {
				flow,
				error: message,
			} );
			throw failure;
		}

		// The gate names the address the confirmation went to, which only the settings know.
		await queryClient.invalidateQueries( { queryKey: userSettingsQuery().queryKey } );
		// A confirmation has just gone out, so the gate opens with the same wait a send leaves.
		markResendUnavailableUntil( scope, Date.now() + RESEND_MIN_INTERVAL_SECONDS * 1000 );
		recordTracksEvent( 'calypso_signup_email_verification_email_update_requested', { flow } );
	};

	return { updateEmail, error };
}
