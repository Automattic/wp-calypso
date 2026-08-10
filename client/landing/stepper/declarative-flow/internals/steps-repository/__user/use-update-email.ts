import { userSettingsQuery } from '@automattic/api-queries';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { markResendUnavailableUntil } from './email-verification/storage';
import { PENDING_CHANGE_RESEND_SECONDS, useEmailChangeRequest } from './use-email-change-request';

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
			// Not the server's message: it names the address of a change already pending, which
			// has no business in analytics.
			recordTracksEvent( 'calypso_signup_email_verification_email_update_failed', { flow } );
			throw failure;
		}

		// Accepted is not sent. Submitting the address the account already holds asks for no
		// change, and answers success without mailing anything, so only a change the response
		// reports as pending is one the gate can go on to wait for.
		if ( ! accepted?.user_email_change_pending || ! accepted?.new_user_email ) {
			return;
		}

		setRequested( { scope, email: accepted.new_user_email } );
		// Only to reconcile a reload; nothing here waits on it.
		queryClient.invalidateQueries( { queryKey: userSettingsQuery().queryKey } );
		// A confirmation has just gone out, and another cannot be sent until the server's window.
		markResendUnavailableUntil( scope, Date.now() + PENDING_CHANGE_RESEND_SECONDS * 1000 );
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
