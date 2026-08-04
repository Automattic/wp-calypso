// What one gate attempt has to remember, keyed by flow and user. Whether the gate is up at all is
// not in here — `/me` answers that. This is the resend lockout, which a reload would otherwise
// forget and reopen the button into a refusal, and when the gate first appeared, for the duration
// metric.
//
// Local rather than session storage because the gate itself now spans tabs: a lockout the server
// is enforcing anyway shouldn't look lifted just because the flow was reopened somewhere else.
// `clearGateMetadata` drops the record when the attempt resolves.

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

// An abandoned attempt leaves its record behind, and a stale one would suppress the next attempt's
// view event and report a duration measured from the wrong day. Past this, with no lockout left to
// honour, a return counts as a new attempt.
const RECORD_TTL_MS = 24 * 60 * 60 * 1000;

function read( scope: string ): GateRecord {
	try {
		const raw = localStorage.getItem( storageKey( scope ) );
		if ( ! raw ) {
			return EMPTY_RECORD;
		}
		const record = JSON.parse( raw ) as GateRecord;
		const isSpent =
			Date.now() - record.shownAt > RECORD_TTL_MS && record.resendAvailableAt <= Date.now();
		return isSpent ? EMPTY_RECORD : record;
	} catch {
		return EMPTY_RECORD;
	}
}

function write( scope: string, record: GateRecord ): void {
	try {
		localStorage.setItem( storageKey( scope ), JSON.stringify( record ) );
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

// Dropped when the attempt resolves, so the next one starts with a fresh duration and no
// inherited lockout. An abandoned attempt keeps its record until the user finishes a later one.
export function clearGateMetadata( scope: string ): void {
	try {
		localStorage.removeItem( storageKey( scope ) );
	} catch {
		// Ignore storage failures; the in-session state has already moved on.
	}
}
