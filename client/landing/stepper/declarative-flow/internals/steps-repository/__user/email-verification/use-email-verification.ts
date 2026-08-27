import { useState } from 'react';
import {
	resendAcceptedRetryAfter,
	resendThrottleRetryAfter,
} from 'calypso/dashboard/utils/email-verification-resend';
import { useResendCooldown } from 'calypso/dashboard/utils/use-resend-cooldown';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { useBackoffPoll } from '../use-backoff-poll';
import { PENDING_CHANGE_RESEND_SECONDS, useEmailChangeRequest } from '../use-email-change-request';
import { ACTIVATION_EMAIL_SOURCE } from '../use-email-verification-gate';
import { gateResendAvailableAt, markResendUnavailableUntil, pendingChangeScope } from './storage';

// `throttled` is distinct from `error`: the send was refused, not failed. It says only why the
// button is held — the countdown says whether it still is.
type SendStatus = 'idle' | 'sending' | 'error' | 'throttled';

// Kept across reloads, so a wait the server is still enforcing survives one.
function usePersistedCooldown( scope: string ) {
	return useResendCooldown( {
		initialDeadline: gateResendAvailableAt( scope ),
		onHold: ( deadline ) => markResendUnavailableUntil( scope, deadline ),
	} );
}

// `pendingEmail` is set while a correction waits to be confirmed, when the dedicated endpoint
// would mail the address being left rather than the one waiting.
export function useEmailVerification( flow: string, scope: string, pendingEmail?: string ) {
	const dispatch = useDispatch();
	const isVerified = useSelector( isCurrentUserEmailVerified );
	const sendVerificationEmail = useSendEmailVerification( { from: ACTIVATION_EMAIL_SOURCE } );
	const { request: askAgain } = useEmailChangeRequest();

	const [ sendStatus, setSendStatus ] = useState< SendStatus >( 'idle' );

	// One wait per path. The server limits them separately, and a wait only ever lengthens, so a
	// long one earned against the address being left would otherwise outlast the correction that
	// was made to escape it.
	const originalCooldown = usePersistedCooldown( scope );
	const pendingCooldown = usePersistedCooldown( pendingChangeScope( scope ) );
	const { secondsUntilResend, hold: holdResend } = pendingEmail
		? pendingCooldown
		: originalCooldown;
	// A confirmation on another device raises no signal — `UserVerificationChecker` covers the same
	// browser — so polling is the only thing that notices it.
	const { restart: restartPoll } = useBackoffPoll(
		() => dispatch( fetchCurrentUser() ),
		! isVerified
	);

	// The initial email is the activation email from account creation; this only resends.
	const resend = async () => {
		setSendStatus( 'sending' );

		try {
			if ( pendingEmail ) {
				await askAgain( pendingEmail );
				holdResend( PENDING_CHANGE_RESEND_SECONDS );
			} else {
				const response = await sendVerificationEmail();
				if ( ! response?.success ) {
					throw new Error( 'unsuccessful_response' );
				}
				holdResend( resendAcceptedRetryAfter( response ) );
			}
			// A fresh link is about to be opened, so poll tightly again from here.
			restartPoll();
			setSendStatus( 'idle' );
			recordTracksEvent( 'calypso_signup_email_verification_email_sent', {
				flow,
				is_resend: true,
			} );
		} catch ( error ) {
			const retryAfter = resendThrottleRetryAfter( error );
			if ( retryAfter !== null ) {
				holdResend( retryAfter );
			}
			setSendStatus( retryAfter !== null ? 'throttled' : 'error' );
			// Unchanged for the dedicated endpoint, so its existing aggregation isn't split. A
			// refusal from the other names the address of a change already pending, which has no
			// business in analytics.
			const reported = error instanceof Error ? error.message : String( error );
			const failure = pendingEmail ? 'pending_change_request_failed' : reported;
			recordTracksEvent( 'calypso_signup_email_verification_email_send_failed', {
				flow,
				is_resend: true,
				error: retryAfter !== null ? 'throttled' : failure,
			} );
		}
	};

	return {
		sendStatus,
		secondsUntilResend,
		resend,
	};
}
