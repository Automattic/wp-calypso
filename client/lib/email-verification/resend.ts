/**
 * The resend side of email verification: what the server will accept, and how long a caller has
 * to wait when it won't. Transport-independent, so anything that offers a resend button can
 * agree with the server without reaching into another feature's hooks.
 */

// Mirrors the server's own minimum interval between two user-requested verification emails, so a
// button reopens when a resend would actually be accepted. The server stays the authority: when
// it refuses, it says how long to wait.
export const RESEND_MIN_INTERVAL_SECONDS = 60;

// The server's hourly lockout is the longest wait it can hand back. Anything past that is a
// corrupt value rather than a real limit, and must not strand someone on a screen with no way on.
const MAX_COOLDOWN_SECONDS = 60 * 60;

export function cooldownRemainingSeconds( availableAt: number ): number {
	const remainingMs = availableAt - Date.now();
	return remainingMs > 0 ? Math.min( Math.ceil( remainingMs / 1000 ), MAX_COOLDOWN_SECONDS ) : 0;
}

// Clamped, so a corrupt stored value can't outlast anything the server would ask for.
export function cooldownDeadline( seconds: number ): number {
	return Date.now() + Math.min( seconds, MAX_COOLDOWN_SECONDS ) * 1000;
}

/**
 * The wait a refused resend asks for, or null if the failure wasn't a refusal.
 *
 * The server rejects with `throttled`/429 and puts the wait, in seconds, under
 * `data.retry_after`. Callers need the distinction because telling someone to try again in a
 * moment is wrong when the wait is an hour.
 */
export function resendThrottleRetryAfter( error: unknown ): number | null {
	if ( typeof error !== 'object' || error === null ) {
		return null;
	}
	const { error: slug, code, data } = error as { error?: string; code?: string; data?: unknown };
	if ( ( slug ?? code ) !== 'throttled' ) {
		return null;
	}
	const retryAfter = ( data as { retry_after?: unknown } | undefined )?.retry_after;
	// A refusal with no usable hint still holds for the standard interval; reopening immediately
	// would only earn another one.
	return typeof retryAfter === 'number' && retryAfter > 0
		? retryAfter
		: RESEND_MIN_INTERVAL_SECONDS;
}
