import { fetchUser, updateUserSettings } from '@automattic/api-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EVERY_FIVE_SECONDS, EVERY_SECOND, useInterval } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchCurrentUser, setUserEmailVerified } from 'calypso/state/current-user/actions';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import {
	cooldownRemainingSeconds,
	gateSentAt,
	markResent,
	RESEND_COOLDOWN_SECONDS,
} from './storage';

// Cross-device confirmation only reaches this tab by polling `/me` (`UserVerificationChecker`
// covers the same-browser case instantly). Cap the polling so a tab left open overnight
// doesn't hit `/me` forever, and only poll while the tab is visible — the user is usually
// away in their email app while this screen is up.
const POLL_LIMIT_MS = 15 * 60 * 1000;

// The manual "I've confirmed" check: idle, in flight, came back still unconfirmed, or the
// request itself failed (kept distinct from unconfirmed so a network error isn't mistaken
// for an unverified email).
type CheckStatus = 'idle' | 'checking' | 'unconfirmed' | 'error';

export function useEmailVerification( flow: string, scope: string, pendingEmail: string | null ) {
	const dispatch = useDispatch();
	const isVerified = useSelector( isCurrentUserEmailVerified );
	const sendVerificationEmail = useSendEmailVerification();

	// The cooldown runs off this in-memory send time. Re-reading storage each tick would
	// report no send when persistence is unavailable and reset the cooldown to zero. Seed
	// from the persisted time to survive a refresh, or now when there's nothing stored.
	const sentAtRef = useRef( gateSentAt( scope ) || Date.now() );

	const [ isSending, setIsSending ] = useState( false );
	const [ hasSendError, setHasSendError ] = useState( false );
	const [ secondsUntilResend, setSecondsUntilResend ] = useState( () =>
		cooldownRemainingSeconds( sentAtRef.current )
	);
	const [ isPollingExpired, setIsPollingExpired ] = useState( false );
	const [ pollWindowKey, setPollWindowKey ] = useState( 0 );
	const [ checkStatus, setCheckStatus ] = useState< CheckStatus >( 'idle' );
	const [ isVisible, setIsVisible ] = useState( () => document.visibilityState === 'visible' );

	// Record that a fresh verification email just went out: restart the cooldown and reopen
	// the polling window (the user might confirm this new link from another device long
	// after the previous window lapsed), and clear any stale check notice.
	const noteSent = useCallback( () => {
		sentAtRef.current = Date.now();
		markResent( scope );
		setSecondsUntilResend( RESEND_COOLDOWN_SECONDS );
		setIsPollingExpired( false );
		setPollWindowKey( ( key ) => key + 1 );
		setCheckStatus( 'idle' );
		setHasSendError( false );
	}, [ scope ] );

	// One resend for both cases, so errors and the send/failure events always surface on the
	// verification screen. When a change is pending the plain resend would mail the account's
	// current (old) address, so re-issue the change instead — that re-sends to the new one.
	const resend = useCallback( async () => {
		setIsSending( true );
		setHasSendError( false );

		try {
			if ( pendingEmail ) {
				await updateUserSettings( { user_email: pendingEmail } );
			} else {
				const { success } = await sendVerificationEmail();
				if ( ! success ) {
					throw new Error( 'unsuccessful_response' );
				}
			}
			noteSent();
			recordTracksEvent( 'calypso_signup_email_verification_email_sent', {
				flow,
				is_resend: true,
			} );
		} catch ( error ) {
			setHasSendError( true );
			recordTracksEvent( 'calypso_signup_email_verification_email_send_failed', {
				flow,
				is_resend: true,
				error: error instanceof Error ? error.message : String( error ),
			} );
		} finally {
			setIsSending( false );
		}
	}, [ pendingEmail, sendVerificationEmail, flow, noteSent ] );

	// Recompute the cooldown from the send time rather than decrementing a counter: mobile
	// browsers suspend timers while the user is away in their email app.
	useInterval(
		() => setSecondsUntilResend( cooldownRemainingSeconds( sentAtRef.current ) ),
		secondsUntilResend > 0 && EVERY_SECOND
	);

	// Track visibility, and on becoming visible refresh the cooldown and check `/me`
	// once immediately instead of waiting for the next poll tick.
	useEffect( () => {
		const onVisibilityChange = () => {
			const visible = document.visibilityState === 'visible';
			setIsVisible( visible );
			if ( visible ) {
				setSecondsUntilResend( cooldownRemainingSeconds( sentAtRef.current ) );
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
		setHasSendError( false );
		recordTracksEvent( 'calypso_signup_email_verification_check_click', { flow } );

		try {
			// `fetchUser` throws on a failed request, so a network problem can't be
			// mistaken for an unconfirmed email the way `fetchCurrentUser` would.
			const { email_verified } = await fetchUser();
			if ( email_verified ) {
				// Flip the flag now for a responsive finish, and refresh the whole user so
				// downstream steps see the (possibly changed) address, not just the flag.
				dispatch( setUserEmailVerified( true ) );
				dispatch( fetchCurrentUser() );
			} else {
				setCheckStatus( 'unconfirmed' );
			}
		} catch {
			setCheckStatus( 'error' );
		}
	}, [ dispatch, flow ] );

	return {
		isVerified,
		isSending,
		hasSendError,
		secondsUntilResend,
		checkStatus,
		checkNow,
		resend,
		noteSent,
	};
}
