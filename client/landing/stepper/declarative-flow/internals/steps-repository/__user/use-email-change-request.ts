import { emailWriteFilters, userEmailSettingsMutation } from '@automattic/api-queries';
import { useIsMutating, useMutation } from '@tanstack/react-query';
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

/**
 * Whether one is in flight, wherever it was started. They share a scope, so a second would wait
 * behind the first, and a reload while it waited would leave its address written down with nothing
 * left able to carry it out. Asked globally because the gate remounts when `/me` resolves someone
 * else, which forgets anything a single instance was keeping.
 */
export function useIsEmailChangePending() {
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
