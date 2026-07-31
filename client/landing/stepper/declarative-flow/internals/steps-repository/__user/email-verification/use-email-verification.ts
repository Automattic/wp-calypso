import { fetchUser } from '@automattic/api-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
	RESEND_MIN_INTERVAL_SECONDS,
	resendThrottleRetryAfter,
	useSendEmailVerification,
} from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EVERY_FIVE_SECONDS, EVERY_SECOND, useInterval } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchCurrentUser, setUserEmailVerified } from 'calypso/state/current-user/actions';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import {
	cooldownRemainingSeconds,
	gateResendAvailableAt,
	markResendUnavailableFor,
} from './storage';

// Cross-device confirmation only reaches this tab by polling `/me` (`UserVerificationChecker`
// covers the same browser instantly). Cap it so a tab left open overnight doesn't poll forever.
const POLL_LIMIT_MS = 15 * 60 * 1000;

// `error` (the request failed) is kept distinct from `unconfirmed` so a network failure
// isn't mistaken for an unverified email.
type CheckStatus = 'idle' | 'checking' | 'unconfirmed' | 'error';

// `throttled` is kept distinct from `error` for the same reason: the send didn't fail, it was
// refused, and telling someone to retry in a moment is wrong when the wait is an hour.
type SendStatus = 'idle' | 'sending' | 'error' | 'throttled';

export function useEmailVerification( flow: string, scope: string ) {
	const dispatch = useDispatch();
	const isVerified = useSelector( isCurrentUserEmailVerified );
	const sendVerificationEmail = useSendEmailVerification();

	// Held in memory because re-reading storage each tick would report no cooldown when
	// persistence is unavailable, reopening the button early. Seeded from storage to survive a
	// refresh — including a server lockout, which would otherwise be forgotten on reload.
	const availableAtRef = useRef(
		gateResendAvailableAt( scope ) || Date.now() + RESEND_MIN_INTERVAL_SECONDS * 1000
	);

	const [ sendStatus, setSendStatus ] = useState< SendStatus >( 'idle' );
	const [ secondsUntilResend, setSecondsUntilResend ] = useState( () =>
		cooldownRemainingSeconds( availableAtRef.current )
	);
	const [ isPollingExpired, setIsPollingExpired ] = useState( false );
	const [ pollWindowKey, setPollWindowKey ] = useState( 0 );
	const [ checkStatus, setCheckStatus ] = useState< CheckStatus >( 'idle' );
	const [ isVisible, setIsVisible ] = useState( () => document.visibilityState === 'visible' );

	// Hold the button until `seconds` have passed, and remember it across a refresh.
	const holdResend = ( seconds: number ) => {
		markResendUnavailableFor( scope, seconds );
		availableAtRef.current = Date.now() + seconds * 1000;
		setSecondsUntilResend( cooldownRemainingSeconds( availableAtRef.current ) );
	};

	// The initial email is the activation email from account creation; this only resends.
	const resend = async () => {
		setSendStatus( 'sending' );

		try {
			const { success } = await sendVerificationEmail();
			if ( ! success ) {
				throw new Error( 'unsuccessful_response' );
			}
			holdResend( RESEND_MIN_INTERVAL_SECONDS );
			// A fresh link restarts the polling window — it may be confirmed elsewhere long
			// after the previous one lapsed.
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
			recordTracksEvent( 'calypso_signup_email_verification_email_send_failed', {
				flow,
				is_resend: true,
				error: retryAfter !== null ? 'throttled' : String( error ),
			} );
		}
	};

	// Recompute the cooldown from the send time rather than decrementing a counter: mobile
	// browsers suspend timers while the user is away in their email app.
	useInterval(
		() => setSecondsUntilResend( cooldownRemainingSeconds( availableAtRef.current ) ),
		secondsUntilResend > 0 && EVERY_SECOND
	);

	// On becoming visible, refresh the cooldown and check `/me` without waiting for the next tick.
	useEffect( () => {
		const onVisibilityChange = () => {
			const visible = document.visibilityState === 'visible';
			setIsVisible( visible );
			if ( visible ) {
				setSecondsUntilResend( cooldownRemainingSeconds( availableAtRef.current ) );
				if ( ! isVerified ) {
					dispatch( fetchCurrentUser() );
				}
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
