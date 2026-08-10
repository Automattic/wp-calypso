import { userSettingsQuery } from '@automattic/api-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { RESEND_MIN_INTERVAL_SECONDS } from 'calypso/dashboard/utils/email-verification-resend';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { markResendUnavailableUntil } from './email-verification/storage';
import { useEmailChangeRequest } from './use-email-change-request';

/**
 * Asks for a corrected address on the account the gate is holding, for a user who mistyped theirs.
 *
 * The address does not move here. The server mails a confirmation to the new one, and opening it
 * both makes the change and verifies the account — which is what returns the user to the flow.
 */
export function useUpdateEmail( { flow, scope }: { flow: string; scope: string } ) {
	const queryClient = useQueryClient();
	// What the server accepted, which is what the gate goes on to wait for. Held here rather than
	// read back, so a settings request that fails or answers from behind does not leave the gate
	// naming an address the account has already been asked to leave.
	const [ requested, setRequested ] = useState< { scope: string; email: string } | null >( null );
	const { request, error, reset } = useEmailChangeRequest();

	const updateEmail = async ( email: string ) => {
		let accepted;

		try {
			accepted = await request( email );
		} catch ( failure ) {
			recordTracksEvent( 'calypso_signup_email_verification_email_update_failed', {
				flow,
				error: failure instanceof Error ? failure.message : String( failure ),
			} );
			throw failure;
		}

		setRequested( { scope, email: accepted?.new_user_email || email } );
		// Only to reconcile a reload; nothing here waits on it.
		queryClient.invalidateQueries( { queryKey: userSettingsQuery().queryKey } );
		// A confirmation has just gone out, so the gate opens with the same wait a send leaves.
		markResendUnavailableUntil( scope, Date.now() + RESEND_MIN_INTERVAL_SECONDS * 1000 );
		recordTracksEvent( 'calypso_signup_email_verification_email_update_requested', { flow } );
	};

	return {
		updateEmail,
		// The server names what it refused better than this can — an address already taken, or one
		// it will not accept.
		error: error instanceof Error ? error.message : null,
		// Cleared by the caller on the way in, so a refusal does not greet the next attempt.
		forget: reset,
		requestedEmail: requested?.scope === scope ? requested.email : null,
	};
}
