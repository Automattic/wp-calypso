import { useCallback, useEffect, useRef, useState } from 'react';
import {
	resendAcceptedRetryAfter,
	resendThrottleRetryAfter,
} from 'calypso/dashboard/utils/email-verification-resend';
import { useResendCooldown } from 'calypso/dashboard/utils/use-resend-cooldown';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	EVERY_MINUTE,
	EVERY_TEN_SECONDS,
	EVERY_THIRTY_SECONDS,
	useInterval,
} from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchCurrentUser } from 'calypso/state/current-user/actions';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { gateResendAvailableAt, markResendUnavailableUntil } from './storage';
import type { TimeoutMS } from 'calypso/types';

// Polling is for the confirmation this tab can't otherwise see: `UserVerificationChecker` covers
// the same browser instantly, and leaving for an inbox hides the tab, which pauses the poll and
// re-checks on return. What's left is a link opened on another device, which raises no signal at
// all — polling is the only thing that will notice it. So the rate backs off rather than
// stopping, and the slowest rung stays short: past it, the wait is time an already-verified
// person spends looking at a screen that has nothing left to tell them.
const POLL_SCHEDULE: { after: TimeoutMS; delay: TimeoutMS }[] = [
	{ after: 0, delay: EVERY_TEN_SECONDS },
	{ after: 5 * EVERY_MINUTE, delay: EVERY_THIRTY_SECONDS },
	{ after: 10 * EVERY_MINUTE, delay: EVERY_MINUTE },
	{ after: 30 * EVERY_MINUTE, delay: 3 * EVERY_MINUTE },
];

function pollDelayAfter( elapsed: number ): TimeoutMS {
	let delay = POLL_SCHEDULE[ 0 ].delay;
	for ( const step of POLL_SCHEDULE ) {
		if ( elapsed >= step.after ) {
			delay = step.delay;
		}
	}
	return delay;
}

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
	const pollStartedAt = useRef( Date.now() );
	const [ pollDelay, setPollDelay ] = useState< TimeoutMS >( POLL_SCHEDULE[ 0 ].delay );
	const [ isVisible, setIsVisible ] = useState( () => document.visibilityState === 'visible' );

	// Moves the poll onto the rung its elapsed time has reached. Called from the tick itself and
	// on return to the tab, which is where a long stretch of not polling gets accounted for.
	const syncPollDelay = useCallback( () => {
		setPollDelay( pollDelayAfter( Date.now() - pollStartedAt.current ) );
	}, [] );

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
			pollStartedAt.current = Date.now();
			setPollDelay( POLL_SCHEDULE[ 0 ].delay );
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

	// On becoming visible, check `/me` without waiting for the next poll tick.
	useEffect( () => {
		const onVisibilityChange = () => {
			const visible = document.visibilityState === 'visible';
			setIsVisible( visible );
			if ( visible && ! isVerified ) {
				dispatch( fetchCurrentUser() );
				syncPollDelay();
			}
		};
		document.addEventListener( 'visibilitychange', onVisibilityChange );
		return () => document.removeEventListener( 'visibilitychange', onVisibilityChange );
	}, [ isVerified, dispatch, syncPollDelay ] );

	useInterval(
		() => {
			dispatch( fetchCurrentUser() );
			syncPollDelay();
		},
		isVisible && ! isVerified && pollDelay
	);

	return {
		isVerified,
		sendStatus,
		secondsUntilResend,
		resend,
	};
}
