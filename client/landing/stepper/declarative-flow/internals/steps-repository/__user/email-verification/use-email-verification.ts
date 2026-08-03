import { fetchUser } from '@automattic/api-core';
import { useCallback, useEffect, useState } from 'react';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	resendAcceptedRetryAfter,
	resendThrottleRetryAfter,
} from 'calypso/lib/email-verification/resend';
import { useResendCooldown } from 'calypso/lib/email-verification/use-resend-cooldown';
import { EVERY_FIVE_SECONDS, useInterval } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchCurrentUser, setUserEmailVerified } from 'calypso/state/current-user/actions';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import { gateResendAvailableAt, markResendUnavailableUntil } from './storage';

// Cross-device confirmation only reaches this tab by polling `/me` (`UserVerificationChecker`
// covers the same browser instantly). Cap it so a tab left open overnight doesn't poll forever.
const POLL_LIMIT_MS = 15 * 60 * 1000;

// `error` (the request failed) is kept distinct from `unconfirmed` so a network failure
// isn't mistaken for an unverified email.
type CheckStatus = 'idle' | 'checking' | 'unconfirmed' | 'error';

// `throttled` is distinct from `error` for the same reason: the send was refused, not failed. It
// says only why the button is held — the countdown says whether it still is.
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
	const [ isPollingExpired, setIsPollingExpired ] = useState( false );
	const [ pollWindowKey, setPollWindowKey ] = useState( 0 );
	const [ checkStatus, setCheckStatus ] = useState< CheckStatus >( 'idle' );
	const [ isVisible, setIsVisible ] = useState( () => document.visibilityState === 'visible' );

	// The initial email is the activation email from account creation; this only resends.
	const resend = async () => {
		setSendStatus( 'sending' );

		try {
			const response = await sendVerificationEmail();
			if ( ! response?.success ) {
				throw new Error( 'unsuccessful_response' );
			}
			holdResend( resendAcceptedRetryAfter( response ) );
			// A fresh link restarts the polling window; it may be confirmed long after the last.
			setIsPollingExpired( false );
			setPollWindowKey( ( key ) => key + 1 );
			setCheckStatus( 'idle' );
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
			}
		};
		document.addEventListener( 'visibilitychange', onVisibilityChange );
		return () => document.removeEventListener( 'visibilitychange', onVisibilityChange );
	}, [ isVerified, dispatch ] );

	useEffect( () => {
		if ( isVerified ) {
			return;
		}
		const timer = setTimeout( () => setIsPollingExpired( true ), POLL_LIMIT_MS );
		return () => clearTimeout( timer );
	}, [ isVerified, pollWindowKey ] );

	useInterval(
		() => dispatch( fetchCurrentUser() ),
		isVisible && ! isVerified && ! isPollingExpired && EVERY_FIVE_SECONDS
	);

	const checkNow = useCallback( async () => {
		setCheckStatus( 'checking' );
		// Clear a stale send failure, but not a throttle — that one is still true, and the
		// button is still counting down against it.
		setSendStatus( ( status ) => ( status === 'error' ? 'idle' : status ) );
		recordTracksEvent( 'calypso_signup_email_verification_check_click', { flow } );

		try {
			// `fetchUser` throws on a failed request, so a network problem can't be
			// mistaken for an unconfirmed email the way `fetchCurrentUser` would.
			const { email_verified } = await fetchUser();
			if ( email_verified ) {
				dispatch( setUserEmailVerified( true ) );
			} else {
				setCheckStatus( 'unconfirmed' );
			}
		} catch {
			setCheckStatus( 'error' );
		}
	}, [ dispatch, flow ] );

	return {
		isVerified,
		sendStatus,
		secondsUntilResend,
		checkStatus,
		checkNow,
		resend,
	};
}
