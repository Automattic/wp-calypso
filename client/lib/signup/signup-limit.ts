import { useState } from 'react';
import { useResendCooldown } from 'calypso/dashboard/account/hooks/use-resend-cooldown';

const STORAGE_KEY = 'wpcom_signup_limit_until';

/**
 * The wait a throttled signup asks for, or null when the server names none.
 *
 * Null rather than a default: a guessed wait could invite a retry the server still refuses.
 */
export function signupThrottleRetryAfter( error: unknown ): number | null {
	if ( typeof error !== 'object' || error === null ) {
		return null;
	}
	const { error: slug, data } = error as { error?: string; data?: unknown };
	if ( slug !== 'throttled' ) {
		return null;
	}
	const retryAfter = ( data as { retry_after?: unknown } | null | undefined )?.retry_after;
	return typeof retryAfter === 'number' && retryAfter > 0 ? retryAfter : null;
}

function readStoredDeadline(): number {
	try {
		return Number( window.localStorage.getItem( STORAGE_KEY ) ) || 0;
	} catch {
		return 0;
	}
}

function storeDeadline( deadline: number ) {
	try {
		window.localStorage.setItem( STORAGE_KEY, String( deadline ) );
	} catch {
		// Without storage the limit still shows until the form is left.
	}
}

export interface SignupLimit {
	secondsRemaining: number;
	hold: ( seconds: number ) => void;
}

/**
 * The signup limit this browser was last refused with, kept across visits to the form.
 */
export function useSignupLimit(): SignupLimit {
	const [ initialDeadline ] = useState( readStoredDeadline );
	const { secondsUntilResend, hold } = useResendCooldown( {
		initialDeadline,
		onHold: storeDeadline,
	} );

	return { secondsRemaining: secondsUntilResend, hold };
}
