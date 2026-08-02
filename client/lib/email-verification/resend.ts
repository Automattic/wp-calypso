/**
 * What the server will accept from a resend, and how long to wait when it won't. Transport
 * independent, so any resend button can agree with the server without reaching into Stepper.
 */

// The server's own interval between sends, so a button reopens when a resend would be accepted.
// It stays the authority though: when it refuses, it says how long to wait.
export const RESEND_MIN_INTERVAL_SECONDS = 5 * 60;

// A spent daily allowance points at the end of the day, so a real wait reaches roughly this.
// Past it the value is corrupt, and must not strand someone on a screen with no way on.
const MAX_COOLDOWN_SECONDS = 24 * 60 * 60;

export function cooldownRemainingSeconds( availableAt: number ): number {
	const remainingMs = availableAt - Date.now();
	return remainingMs > 0 ? Math.min( Math.ceil( remainingMs / 1000 ), MAX_COOLDOWN_SECONDS ) : 0;
}

// Clamped, so a corrupt stored value can't outlast anything the server would ask for.
export function cooldownDeadline( seconds: number ): number {
	return Date.now() + Math.min( seconds, MAX_COOLDOWN_SECONDS ) * 1000;
}

/**
 * A wait as a clock: `m:ss`, or `h:mm:ss` past an hour, which the daily allowance reaches.
 * Ticking digits read as a countdown where a rounded "in 25 minutes" doesn't.
 */
export function formatCooldown( seconds: number ): string {
	const hours = Math.floor( seconds / 3600 );
	const minutes = Math.floor( ( seconds % 3600 ) / 60 );
	const pad = ( value: number ) => String( value ).padStart( 2, '0' );

	return hours > 0
		? `${ hours }:${ pad( minutes ) }:${ pad( seconds % 60 ) }`
		: `${ minutes }:${ pad( seconds % 60 ) }`;
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
	// A refusal with no usable hint still holds; reopening now would only earn another.
	return typeof retryAfter === 'number' && retryAfter > 0
		? retryAfter
		: RESEND_MIN_INTERVAL_SECONDS;
}
