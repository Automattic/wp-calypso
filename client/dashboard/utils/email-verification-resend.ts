/**
 * What the server will accept from a resend, and how long to wait when it won't. Transport
 * independent, so any resend button can agree with the server without reaching into Stepper.
 */

// What to assume when a response carries no wait of its own. The server reports one on both
// outcomes, so this is only reached by an app server answering from before that field existed, or
// by a bare 429 from somewhere upstream of it.
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

// Seconds, on both outcomes. Anything unusable falls back rather than reopening the button, which
// would only earn a refusal.
function retryAfterSeconds( value: unknown ): number {
	return typeof value === 'number' && value > 0 ? value : RESEND_MIN_INTERVAL_SECONDS;
}

/**
 * The wait an accepted resend has just imposed, reported at the top level of the response.
 *
 * Not always the interval: a send that spends the last of the daily allowance answers with the
 * wait until that allowance resets.
 */
export function resendAcceptedRetryAfter( response: unknown ): number {
	return retryAfterSeconds( ( response as { retry_after?: unknown } | undefined )?.retry_after );
}

/**
 * The wait a refused resend asks for, or null if the failure wasn't a refusal.
 *
 * The server rejects with `throttled`/429 and puts the wait under `data.retry_after`. Callers
 * need the distinction because telling someone to try again in a moment is wrong when the wait
 * is an hour.
 */
export function resendThrottleRetryAfter( error: unknown ): number | null {
	if ( typeof error !== 'object' || error === null ) {
		return null;
	}
	const { error: slug, code, data } = error as { error?: string; code?: string; data?: unknown };
	if ( ( slug ?? code ) !== 'throttled' ) {
		return null;
	}
	return retryAfterSeconds( ( data as { retry_after?: unknown } | undefined )?.retry_after );
}
