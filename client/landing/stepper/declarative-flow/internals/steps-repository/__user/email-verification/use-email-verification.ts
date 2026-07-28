import { fetchUser } from '@automattic/api-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EVERY_FIVE_SECONDS, EVERY_SECOND, useInterval } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchCurrentUser, setUserEmailVerified } from 'calypso/state/current-user/actions';
import { getCurrentUser, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import {
	cooldownRemainingSeconds,
	gateScope,
	gateSentAt,
	markResent,
	RESEND_COOLDOWN_SECONDS,
} from './storage';

// Cross-device confirmation only reaches this tab by polling `/me` (`UserVerificationChecker`
// covers the same-browser case instantly). Cap the polling so a tab left open overnight
// doesn't hit `/me` forever, and only poll while the tab is visible — the user is usually
// away in their email app while this screen is up.
const POLL_LIMIT_MS = 15 * 60 * 1000;

export function useEmailVerification( flow: string ) {
	const dispatch = useDispatch();
	const isVerified = useSelector( isCurrentUserEmailVerified );
	const userId = useSelector( getCurrentUser )?.ID;
	const scope = gateScope( flow, userId );
	const sendVerificationEmail = useSendEmailVerification();

	// The cooldown is driven by this in-memory send time, not by re-reading storage each
	// tick: if persistence is unavailable, storage would report no send and reset the
	// cooldown to zero, letting the user resend every second. Seed it from the persisted
	// time (to survive a refresh), or from now when there's nothing stored.
	const sentAtRef = useRef< number >( 0 );
	if ( ! sentAtRef.current ) {
		sentAtRef.current = gateSentAt( scope ) || Date.now();
	}

	const [ isSending, setIsSending ] = useState( false );
	const [ hasSendError, setHasSendError ] = useState( false );
	const [ secondsUntilResend, setSecondsUntilResend ] = useState( () =>
		cooldownRemainingSeconds( sentAtRef.current )
	);
	const [ isPollingExpired, setIsPollingExpired ] = useState( false );
	const [ pollWindowKey, setPollWindowKey ] = useState( 0 );
	const [ isChecking, setIsChecking ] = useState( false );
	const [ hasFailedCheck, setHasFailedCheck ] = useState( false );
	const [ hasCheckError, setHasCheckError ] = useState( false );
	const [ isVisible, setIsVisible ] = useState( () => document.visibilityState === 'visible' );

	// The initial email is the activation email from account creation; this only resends.
	const resend = useCallback( async () => {
		setIsSending( true );
		setHasSendError( false );

		try {
			const { success } = await sendVerificationEmail();
			if ( ! success ) {
				throw new Error( 'unsuccessful_response' );
			}
			sentAtRef.current = Date.now();
			markResent( scope );
			setSecondsUntilResend( RESEND_COOLDOWN_SECONDS );
			// A fresh link restarts the polling window: the user might confirm this new
			// link from another device long after the previous window lapsed.
			setIsPollingExpired( false );
			setPollWindowKey( ( key ) => key + 1 );
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
	}, [ sendVerificationEmail, flow, scope ] );

	// Recompute the cooldown from the stored send time rather than decrementing: mobile
	// browsers suspend timers while the user is in their email app.
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
	}, [ scope, isVerified, dispatch ] );

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
		setIsChecking( true );
		setHasFailedCheck( false );
		setHasCheckError( false );

		recordTracksEvent( 'calypso_signup_email_verification_check_click', { flow } );

		try {
			// `fetchUser` throws on a failed request, so a network problem can't be
			// mistaken for an unconfirmed email the way `fetchCurrentUser` would.
			const { email_verified } = await fetchUser();
			if ( email_verified ) {
				dispatch( setUserEmailVerified( true ) );
			} else {
				setHasFailedCheck( true );
			}
		} catch {
			setHasCheckError( true );
		} finally {
			setIsChecking( false );
		}
	}, [ dispatch, flow ] );

	return {
		isVerified,
		isSending,
		hasSendError,
		secondsUntilResend,
		isChecking,
		hasFailedCheck,
		hasCheckError,
		checkNow,
		resend,
	};
}
