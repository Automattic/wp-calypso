import { emailWriteFilters, userEmailSettingsMutation } from '@automattic/api-queries';
import { useIsMutating, useMutation } from '@tanstack/react-query';
import { ACTIVATION_EMAIL_SOURCE } from './use-email-verification-gate';

/**
 * Asks the server for an address. What it does with that is worth knowing wherever it is called:
 *
 * - The address does not move. A confirmation goes to the new one, and opening that both makes the
 *   change and verifies the account. Until then `/me` still reports the old address.
 * - Asking again is the only way to send the confirmation again; there is no endpoint that resends
 *   one. So a correction and a resend are the same request.
 * - A repeat of the same address inside fifteen minutes is answered success without sending.
 * - A refusal names the address of a change already pending, so its message stays on screen.
 *
 * It fails offline rather than waiting for a connection. A waiting one is written to storage with
 * the address in it, and restored without the function that would carry it out, where it holds up
 * every later attempt in its own scope.
 */
// The server suppresses a repeat of the same pending address for this long, answering success
// without sending, so offering to resend sooner offers something that cannot happen.
export const PENDING_CHANGE_RESEND_SECONDS = 15 * 60;

/**
 * Whether one is in flight, wherever it was started. They share a scope, so a second would wait
 * behind the first, and a reload while it waited would leave its address written down with nothing
 * left able to carry it out. Asked globally because the gate remounts when `/me` resolves someone
 * else, which forgets anything a single instance was keeping.
 */
export function useIsEmailWriteInFlight() {
	return useIsMutating( emailWriteFilters ) > 0;
}

export function useEmailChangeRequest() {
	const { mutateAsync, error, reset } = useMutation( {
		...userEmailSettingsMutation(),
		networkMode: 'always',
	} );

	return {
		error,
		reset,
		request: ( email: string ) =>
			mutateAsync( {
				user_email: email,
				// Recorded against the pending change, so confirming it returns to the flow rather
				// than landing on account settings.
				user_email_change_requested_from: ACTIVATION_EMAIL_SOURCE,
			} ),
	};
}
