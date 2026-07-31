import wpcom from 'calypso/lib/wp';

// Mirrors the server's own minimum interval between two user-requested verification emails, so
// a resend button reopens when one would actually be accepted. The server stays the authority:
// when it refuses, it says how long to wait.
export const RESEND_MIN_INTERVAL_SECONDS = 60;

// The server refuses a resend with `throttled`/429 and puts the wait, in seconds, under
// `data.retry_after`. Returns null for anything that isn't a throttle, so callers can keep
// telling a refusal apart from a failure.
export function resendThrottleRetryAfter( error: unknown ): number | null {
	if ( typeof error !== 'object' || error === null ) {
		return null;
	}
	const { error: slug, code, data } = error as { error?: string; code?: string; data?: unknown };
	if ( ( slug ?? code ) !== 'throttled' ) {
		return null;
	}
	const retryAfter = ( data as { retry_after?: unknown } | undefined )?.retry_after;
	// A throttle with no usable hint still holds the button for the standard interval; reopening
	// it immediately would only earn another refusal.
	return typeof retryAfter === 'number' && retryAfter > 0
		? retryAfter
		: RESEND_MIN_INTERVAL_SECONDS;
}

export interface ResendEmailVerificationBody {
	from?: string; // Helps decide the url of the page after confirmation.
}

export function useSendEmailVerification( body: ResendEmailVerificationBody = {} ) {
	return async () => {
		return wpcom.req.post( '/me/send-verification-email', {
			apiVersion: '1.1',
			...body,
		} );
	};
}
