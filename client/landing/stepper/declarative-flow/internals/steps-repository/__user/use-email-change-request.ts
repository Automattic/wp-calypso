import { userEmailSettingsMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { ACTIVATION_EMAIL_SOURCE } from './use-email-verification-gate';

/**
 * Asks for an address, which is also what sends its confirmation again — there is no endpoint that
 * resends one — so correcting an address and resending its confirmation are the same request, and
 * have to stay the same request.
 *
 * It fails offline rather than waiting for a connection. A waiting one is written to storage with
 * the address in it, and restored without the function that would carry it out, where it holds up
 * every later attempt in its own scope.
 */
// The server suppresses a repeat of the same pending address for this long, answering success
// without sending, so offering to resend sooner offers something that cannot happen.
export const PENDING_CHANGE_RESEND_SECONDS = 15 * 60;

export function useEmailChangeRequest() {
	const mutation = useMutation( { ...userEmailSettingsMutation(), networkMode: 'always' } );

	return {
		...mutation,
		request: ( email: string ) =>
			mutation.mutateAsync( {
				user_email: email,
				// Recorded against the pending change, so confirming it returns to the flow rather
				// than landing on account settings.
				user_email_change_requested_from: ACTIVATION_EMAIL_SOURCE,
			} ),
	};
}
