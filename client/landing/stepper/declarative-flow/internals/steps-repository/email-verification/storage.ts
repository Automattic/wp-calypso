// Session-storage state for the email-verification gate, keyed by flow and user
// so it survives leaving/re-entering the account step or a full refresh — component
// state alone would reset and either re-send, reset the cooldown, or (for the gate
// itself) let the user slip past without a confirmed/skipped event.

export const RESEND_COOLDOWN_SECONDS = 60;

const LAST_SENT_KEY = 'onboarding-email-verification-last-sent';
const RESOLVED_KEY = 'onboarding-email-verification-resolved';

export function gateScope( flow: string, userId: number | undefined ): string {
	return `${ flow }:${ userId ?? '' }`;
}

function read( key: string, scope: string ): string | null {
	try {
		return sessionStorage.getItem( `${ key }:${ scope }` );
	} catch {
		return null;
	}
}

function write( key: string, scope: string, value: string ): void {
	try {
		sessionStorage.setItem( `${ key }:${ scope }`, value );
	} catch {
		// Ignore storage failures (private mode, quota); the state just won't persist.
	}
}

export function readLastSentAt( scope: string ): number {
	return Number( read( LAST_SENT_KEY, scope ) ) || 0;
}

export function hasLastSentAt( scope: string ): boolean {
	return readLastSentAt( scope ) > 0;
}

export function writeLastSentAt( scope: string, at: number ): void {
	write( LAST_SENT_KEY, scope, String( at ) );
}

export function cooldownRemainingSeconds( scope: string ): number {
	const remainingMs = RESEND_COOLDOWN_SECONDS * 1000 - ( Date.now() - readLastSentAt( scope ) );
	return remainingMs > 0 ? Math.min( Math.ceil( remainingMs / 1000 ), RESEND_COOLDOWN_SECONDS ) : 0;
}

// The gate is "resolved" once the user confirms or skips it. Persisted so a refresh
// re-shows the gate while it is still pending, but not after it has been dealt with.
export function isGateResolved( scope: string ): boolean {
	return read( RESOLVED_KEY, scope ) === '1';
}

export function markGateResolved( scope: string ): void {
	write( RESOLVED_KEY, scope, '1' );
}
