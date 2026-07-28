// Session-storage state for the email-verification gate, keyed by flow and user so
// it survives leaving/re-entering the account step or a refresh. The `pending` marker
// is set precisely when this onboarding attempt creates an email account and cleared
// when the gate is confirmed or skipped — so it, not a general signup marker, is what
// makes the gate eligible.

export const RESEND_COOLDOWN_SECONDS = 60;

const LAST_SENT_KEY = 'onboarding-email-verification-last-sent';
const PENDING_KEY = 'onboarding-email-verification-pending';

export function gateScope( flow: string, userId: number | string | undefined ): string {
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

function remove( key: string, scope: string ): void {
	try {
		sessionStorage.removeItem( `${ key }:${ scope }` );
	} catch {
		// no-op
	}
}

export function isVerificationPending( scope: string ): boolean {
	return read( PENDING_KEY, scope ) === '1';
}

export function markVerificationPending( scope: string ): void {
	write( PENDING_KEY, scope, '1' );
}

export function clearVerificationPending( scope: string ): void {
	remove( PENDING_KEY, scope );
}

export function readLastSentAt( scope: string ): number {
	return Number( read( LAST_SENT_KEY, scope ) ) || 0;
}

export function writeLastSentAt( scope: string, at: number ): void {
	write( LAST_SENT_KEY, scope, String( at ) );
}

export function cooldownRemainingSeconds( scope: string ): number {
	const remainingMs = RESEND_COOLDOWN_SECONDS * 1000 - ( Date.now() - readLastSentAt( scope ) );
	return remainingMs > 0 ? Math.min( Math.ceil( remainingMs / 1000 ), RESEND_COOLDOWN_SECONDS ) : 0;
}
