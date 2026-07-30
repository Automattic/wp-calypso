import { fetchUser, updateUserSettings } from '@automattic/api-core';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useSendEmailVerification } from 'calypso/landing/stepper/hooks/use-send-email-verification';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { EVERY_FIVE_SECONDS, EVERY_SECOND, useInterval } from 'calypso/lib/interval';
import { filterUserObject } from 'calypso/lib/user/shared-utils/filter-user-object';
import { useDispatch, useSelector } from 'calypso/state';
import { fetchCurrentUser, setCurrentUser } from 'calypso/state/current-user/actions';
import { getCurrentUser } from 'calypso/state/current-user/selectors';
import {
	cooldownRemainingSeconds,
	gateSentAt,
	markResent,
	PENDING_EMAIL_RESEND_COOLDOWN_SECONDS,
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

const sameEmail = ( a: string | undefined, b: string | undefined ): boolean =>
	!! a && !! b && a.trim().toLowerCase() === b.trim().toLowerCase();

// The gate completes only when the *requested* address is verified — not the account-wide
// flag. Otherwise, after changing A → B, an already-verified A would finish the gate while B
// (the address we asked the user to confirm) is still unconfirmed.
const isTargetVerified = (
	user: { email?: string; email_verified?: boolean } | null | undefined,
	targetEmail: string
): boolean => !! user?.email_verified && sameEmail( user?.email, targetEmail );

export function useEmailVerification( flow: string, scope: string, pendingEmail: string | null ) {
	const dispatch = useDispatch();
	const user = useSelector( getCurrentUser );
	const sendVerificationEmail = useSendEmailVerification();

	const targetEmail = pendingEmail ?? user?.email ?? '';
	const targetVerified = isTargetVerified( user, targetEmail );
	// A pending change is rate-limited server-side at ~15 min; match that so the button
	// isn't offered before the backend would actually resend.
	const cooldownSeconds = pendingEmail
		? PENDING_EMAIL_RESEND_COOLDOWN_SECONDS
		: RESEND_COOLDOWN_SECONDS;

	// The cooldown runs off this in-memory send time. Re-reading storage each tick would
	// report no send when persistence is unavailable and reset the cooldown to zero. Seed
	// from the persisted time to survive a refresh, or now when there's nothing stored.
	const sentAtRef = useRef( gateSentAt( scope ) || Date.now() );

	const [ isSending, setIsSending ] = useState( false );
	const [ hasSendError, setHasSendError ] = useState( false );
	const [ secondsUntilResend, setSecondsUntilResend ] = useState( () =>
		cooldownRemainingSeconds( sentAtRef.current, cooldownSeconds )
	);
	const [ isPollingExpired, setIsPollingExpired ] = useState( false );
	const [ pollWindowKey, setPollWindowKey ] = useState( 0 );
	const [ checkStatus, setCheckStatus ] = useState< CheckStatus >( 'idle' );
	const [ isVisible, setIsVisible ] = useState( () => document.visibilityState === 'visible' );

	// Record that a fresh verification email just went out: restart the cooldown and reopen
	// the polling window (the user might confirm this new link from another device long
	// after the previous window lapsed), and clear any stale check notice.
	const noteSent = useCallback(
		// `overrideCooldown` covers the send that also switches the cooldown type (updating
		// to a pending address): this closure still sees the pre-switch `cooldownSeconds`.
		( overrideCooldown?: number ) => {
			sentAtRef.current = Date.now();
			markResent( scope );
			setSecondsUntilResend( overrideCooldown ?? cooldownSeconds );
			setIsPollingExpired( false );
			setPollWindowKey( ( key ) => key + 1 );
			setCheckStatus( 'idle' );
			setHasSendError( false );
		},
		[ scope, cooldownSeconds ]
	);

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
		() => setSecondsUntilResend( cooldownRemainingSeconds( sentAtRef.current, cooldownSeconds ) ),
		secondsUntilResend > 0 && EVERY_SECOND
	);

	// Track visibility, and on becoming visible refresh the cooldown and check `/me`
	// once immediately instead of waiting for the next poll tick.
	useEffect( () => {
		const onVisibilityChange = () => {
			const visible = document.visibilityState === 'visible';
			setIsVisible( visible );
			if ( visible ) {
				setSecondsUntilResend( cooldownRemainingSeconds( sentAtRef.current, cooldownSeconds ) );
				if ( ! targetVerified ) {
					dispatch( fetchCurrentUser() );
				}
			}
		};
		document.addEventListener( 'visibilitychange', onVisibilityChange );
		return () => document.removeEventListener( 'visibilitychange', onVisibilityChange );
	}, [ targetVerified, cooldownSeconds, dispatch ] );

	useEffect( () => {
		if ( targetVerified ) {
			return;
		}
		const timer = setTimeout( () => setIsPollingExpired( true ), POLL_LIMIT_MS );
		return () => clearTimeout( timer );
	}, [ targetVerified, pollWindowKey ] );

	useInterval(
		() => dispatch( fetchCurrentUser() ),
		isVisible && ! targetVerified && ! isPollingExpired && EVERY_FIVE_SECONDS
	);

	const checkNow = useCallback( async () => {
		setCheckStatus( 'checking' );
		setHasSendError( false );
		recordTracksEvent( 'calypso_signup_email_verification_check_click', { flow } );

		try {
			// `fetchUser` throws on a failed request, so a network problem can't be
			// mistaken for an unconfirmed email the way `fetchCurrentUser` would.
			const checkedUser = await fetchUser();
			if ( isTargetVerified( checkedUser, targetEmail ) ) {
				// Commit the whole fetched user (not just a flag) so downstream steps see the
				// confirmed address; normalize it the way the standard `/me` fetch does so
				// computed fields (locale, primary site) aren't dropped. The `targetVerified`
				// effect then finishes the gate.
				dispatch( setCurrentUser( filterUserObject( checkedUser ) ) );
			} else {
				setCheckStatus( 'unconfirmed' );
			}
		} catch {
			setCheckStatus( 'error' );
		}
	}, [ dispatch, flow, targetEmail ] );

	return {
		isVerified: targetVerified,
		isSending,
		hasSendError,
		secondsUntilResend,
		checkStatus,
		checkNow,
		resend,
		noteSent,
	};
}
