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

export function useEmailVerification( flow: string ) {
	const dispatch = useDispatch();
	const isVerified = useSelector( isCurrentUserEmailVerified );
	const sendVerificationEmail = useSendEmailVerification();

	const [ isSending, setIsSending ] = useState( false );
	const [ hasSendError, setHasSendError ] = useState( false );
	const [ secondsUntilResend, setSecondsUntilResend ] = useState( 0 );
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

	// The signup email was sent minutes ago and is buried by now. Send a fresh
	// link so the one the user is being asked to click is at the top of the inbox.
	const hasSentOnMount = useRef( false );
	useEffect( () => {
		if ( hasSentOnMount.current || isVerified ) {
			return;
		}
		hasSentOnMount.current = true;
		sendRef.current( false );
	}, [ isVerified ] );

	useInterval(
		() => setSecondsUntilResend( ( seconds ) => Math.max( 0, seconds - 1 ) ),
		secondsUntilResend > 0 && EVERY_SECOND
	);

	useEffect( () => {
		if ( isVerified ) {
			return;
		}
		const timer = setTimeout( () => setIsPollingExpired( true ), POLL_LIMIT_MS );
		return () => clearTimeout( timer );
	}, [ isVerified, pollWindowKey ] );

	useInterval(
		() => dispatch( fetchCurrentUser() ),
		! isVerified && ! isPollingExpired && EVERY_FIVE_SECONDS
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
