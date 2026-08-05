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
import { gateResendAvailableAt, markResendUnavailableUntil } from './storage';

// `throttled` is distinct from `error`: the send was refused, not failed. It says only why the
// button is held — the countdown says whether it still is.
type SendStatus = 'idle' | 'sending' | 'error' | 'throttled';

export function useEmailVerification( flow: string, scope: string ) {
	const dispatch = useDispatch();
	const isVerified = useSelector( isCurrentUserEmailVerified );
	const sendVerificationEmail = useSendEmailVerification();

	const [ sendStatus, setSendStatus ] = useState< SendStatus >( 'idle' );

	const { secondsUntilResend, hold: holdResend } = useResendCooldown( {
		initialDeadline: gateResendAvailableAt( scope ),
		onHold: ( deadline ) => markResendUnavailableUntil( scope, deadline ),
	} );
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
			const response = await sendVerificationEmail();
			if ( ! response?.success ) {
				throw new Error( 'unsuccessful_response' );
			}
			holdResend( resendAcceptedRetryAfter( response ) );
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
			// Unchanged for ordinary failures, so their existing aggregation isn't split.
			const failure = error instanceof Error ? error.message : String( error );
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
