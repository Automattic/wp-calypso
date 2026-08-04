// What the gate has to remember between renders of itself, keyed by flow and user. Whether the
// gate is up at all is not in here — `/me` answers that. This is only the resend lockout, which a
// reload would otherwise forget, and when the gate first appeared, for the duration metric.

const STORAGE_KEY = 'onboarding-email-verification-gate';

export function gateScope( flow: string, userId: number | string | null | undefined ): string {
	return `${ flow }:${ userId ?? '' }`;
}

interface GateRecord {
	resendAvailableAt: number;
	shownAt: number;
}

const EMPTY_RECORD: GateRecord = { resendAvailableAt: 0, shownAt: 0 };

function storageKey( scope: string ): string {
	return `${ STORAGE_KEY }:${ scope }`;
}

function read( scope: string ): GateRecord {
	try {
		const raw = sessionStorage.getItem( storageKey( scope ) );
		return raw ? ( JSON.parse( raw ) as GateRecord ) : EMPTY_RECORD;
	} catch {
		return EMPTY_RECORD;
	}
}

function write( scope: string, record: GateRecord ): void {
	try {
		sessionStorage.setItem( storageKey( scope ), JSON.stringify( record ) );
	} catch {
		// Ignore storage failures (private mode, quota); the state just won't persist.
	}
}

/**
 * Stamps the gate as shown, so the duration metric excludes the token-load and user-hydration
 * wait before it, and reports whether this call was the one that stamped it — which is what makes
 * a per-gate event fire once rather than once per mount.
 *
 * With storage unavailable the write is dropped and every call reports true, so a caller falls
 * back to once per mount rather than going silent.
 */
export function markGateShown( scope: string ): boolean {
	const record = read( scope );
	if ( record.shownAt ) {
		return false;
	}
	write( scope, { ...record, shownAt: Date.now() } );
	return true;
}

// Persisted so a reload doesn't forget a lockout and reopen the button into a refusal.
export function markResendUnavailableUntil( scope: string, deadline: number ): void {
	write( scope, { ...read( scope ), resendAvailableAt: deadline } );
}

export function gateShownAt( scope: string ): number {
	return read( scope ).shownAt || Date.now();
}

// 0 when nothing is stored, which is also right when storage is unavailable: nothing claimed.
export function gateResendAvailableAt( scope: string ): number {
	return read( scope ).resendAvailableAt;
}
