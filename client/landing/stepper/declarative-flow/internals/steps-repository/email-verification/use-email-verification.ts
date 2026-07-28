import { fetchUser } from '@automattic/api-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EVERY_FIVE_SECONDS, EVERY_SECOND, useInterval } from 'calypso/lib/interval';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchCurrentUser, setUserEmailVerified } from 'calypso/state/current-user/actions';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';

const RESEND_COOLDOWN_SECONDS = 60;

// Cross-tab/device confirmation only reaches this tab by polling `/me`
// (`UserVerificationChecker` handles the same-browser case instantly). Cap the
// polling so a tab left open overnight doesn't hit `/me` forever.
const POLL_LIMIT_MS = 15 * 60 * 1000;

// The cooldown lives in session storage, keyed by flow, so it survives leaving
// and re-entering the step (via Back) or a refresh — the component state alone
// would reset and let the user resend immediately.
const LAST_SENT_STORAGE_KEY = 'onboarding-email-verification-last-sent';

function readLastSentAt( flow: string ): number {
	try {
		return Number( sessionStorage.getItem( `${ LAST_SENT_STORAGE_KEY }:${ flow }` ) ) || 0;
	} catch {
		return 0;
	}
}

function writeLastSentAt( flow: string, at: number ): void {
	try {
		sessionStorage.setItem( `${ LAST_SENT_STORAGE_KEY }:${ flow }`, String( at ) );
	} catch {
		// Ignore storage failures (private mode, quota); the cooldown just won't persist.
	}
}

function cooldownRemainingSeconds( flow: string ): number {
	const remainingMs = RESEND_COOLDOWN_SECONDS * 1000 - ( Date.now() - readLastSentAt( flow ) );
	return remainingMs > 0 ? Math.min( Math.ceil( remainingMs / 1000 ), RESEND_COOLDOWN_SECONDS ) : 0;
}

export function useEmailVerification( flow: string, enabled: boolean ) {
	const dispatch = useDispatch();
	const isVerified = useSelector( isCurrentUserEmailVerified );
	const sendVerificationEmail = useSendEmailVerification();

	const [ isSending, setIsSending ] = useState( false );
	const [ hasSendError, setHasSendError ] = useState( false );
	const [ secondsUntilResend, setSecondsUntilResend ] = useState( () =>
		cooldownRemainingSeconds( flow )
	);
	const [ isPollingExpired, setIsPollingExpired ] = useState( false );
	const [ pollWindowKey, setPollWindowKey ] = useState( 0 );
	const [ isChecking, setIsChecking ] = useState( false );
	const [ hasFailedCheck, setHasFailedCheck ] = useState( false );
	const [ hasCheckError, setHasCheckError ] = useState( false );

	const send = async ( isResend: boolean ) => {
		setIsSending( true );
		setHasSendError( false );

		try {
			const { success } = await sendVerificationEmail();
			if ( ! success ) {
				throw new Error( 'unsuccessful_response' );
			}
			writeLastSentAt( flow, Date.now() );
			setSecondsUntilResend( RESEND_COOLDOWN_SECONDS );
			// A fresh link restarts the polling window: the user might confirm this
			// new link from another device long after the previous window lapsed.
			setIsPollingExpired( false );
			setPollWindowKey( ( key ) => key + 1 );
			recordTracksEvent( 'calypso_signup_email_verification_email_sent', {
				flow,
				is_resend: isResend,
			} );
		} catch ( error ) {
			setHasSendError( true );
			recordTracksEvent( 'calypso_signup_email_verification_email_send_failed', {
				flow,
				is_resend: isResend,
				error: error instanceof Error ? error.message : String( error ),
			} );
		} finally {
			setIsSending( false );
		}
	};

	// `useSendEmailVerification` hands back a fresh closure every render, so `send`
	// is never stable. Callers reach it through the ref to stay stable themselves.
	const sendRef = useRef( send );
	useEffect( () => {
		sendRef.current = send;
	} );

	// Account creation already sent the activation email seconds ago, so don't fire
	// another one — just seed the resend cooldown from here. Only the resend button
	// calls the endpoint. (A remount within the window keeps the persisted cooldown.)
	const hasSeededCooldown = useRef( false );
	useEffect( () => {
		if ( ! enabled || hasSeededCooldown.current || isVerified ) {
			return;
		}
		hasSeededCooldown.current = true;
		if ( cooldownRemainingSeconds( flow ) === 0 ) {
			writeLastSentAt( flow, Date.now() );
			setSecondsUntilResend( RESEND_COOLDOWN_SECONDS );
		}
	}, [ enabled, isVerified, flow ] );

	// Recompute from the stored send time rather than decrementing: mobile browsers
	// suspend timers while the user is in their email app, so a plain counter would
	// under-count the elapsed cooldown. Also refresh the moment the tab is shown again.
	useInterval(
		() => setSecondsUntilResend( cooldownRemainingSeconds( flow ) ),
		secondsUntilResend > 0 && EVERY_SECOND
	);

	useEffect( () => {
		const refreshOnVisible = () => {
			if ( document.visibilityState === 'visible' ) {
				setSecondsUntilResend( cooldownRemainingSeconds( flow ) );
			}
		};
		document.addEventListener( 'visibilitychange', refreshOnVisible );
		return () => document.removeEventListener( 'visibilitychange', refreshOnVisible );
	}, [ flow ] );

	useEffect( () => {
		if ( ! enabled || isVerified ) {
			return;
		}
		const timer = setTimeout( () => setIsPollingExpired( true ), POLL_LIMIT_MS );
		return () => clearTimeout( timer );
	}, [ enabled, isVerified, pollWindowKey ] );

	useInterval(
		() => dispatch( fetchCurrentUser() ),
		enabled && ! isVerified && ! isPollingExpired && EVERY_FIVE_SECONDS
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
		resend: useCallback( () => sendRef.current( true ), [] ),
	};
}
