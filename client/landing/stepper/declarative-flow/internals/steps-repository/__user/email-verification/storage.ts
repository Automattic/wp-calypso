// One gate attempt, keyed by flow and user. Whether the gate opens is not in here — `/me` answers
// that. Local rather than session storage because an attempt spans tabs, and a lockout or a
// confirmation counted once per tab is counted wrong.

const STORAGE_KEY = 'onboarding-email-verification-gate';

export function gateScope( flow: string, userId: number | string | null | undefined ): string {
	return `${ flow }:${ userId ?? '' }`;
}

interface GateRecord {
	startedAt: number; // anchors the TTL
	isNewSignup: boolean; // an email really was just sent, rather than one carried over
	shownAt: number;
	resendAvailableAt: number;
	confirmedAt: number; // claimed by one tab, so only that one records the confirmation
}

const EMPTY_RECORD: GateRecord = {
	startedAt: 0,
	isNewSignup: false,
	shownAt: 0,
	resendAvailableAt: 0,
	confirmedAt: 0,
};

// Past this an abandoned attempt stops speaking for the next one.
const ATTEMPT_TTL_MS = 24 * 60 * 60 * 1000;

function storageKey( scope: string ): string {
	return `${ STORAGE_KEY }:${ scope }`;
}

// Storage can be unavailable or full. Without a fallback the view would still be recorded and the
// confirmation silently wouldn't, since one reports success on a failed write and the other reads
// back an empty record. This tab's accounting stays intact; cross-tab dedup is best-effort there.
const memoryRecords = new Map< string, GateRecord >();
let isStorageUsable = true;

function hydrate( stored: Partial< GateRecord > | undefined ): GateRecord {
	if ( ! stored ) {
		return EMPTY_RECORD;
	}
	const record = { ...EMPTY_RECORD, ...stored };
	const isSpent =
		Date.now() - record.startedAt > ATTEMPT_TTL_MS && record.resendAvailableAt <= Date.now();
	return isSpent ? EMPTY_RECORD : record;
}

function read( scope: string ): GateRecord {
	if ( isStorageUsable ) {
		try {
			const raw = localStorage.getItem( storageKey( scope ) );
			return hydrate( raw ? ( JSON.parse( raw ) as Partial< GateRecord > ) : undefined );
		} catch {
			isStorageUsable = false;
		}
	}
	return hydrate( memoryRecords.get( scope ) );
}

function write( scope: string, record: Partial< GateRecord > ): void {
	const next = { ...read( scope ), ...record };
	next.startedAt = next.startedAt || Date.now();
	memoryRecords.set( scope, next );
	try {
		localStorage.setItem( storageKey( scope ), JSON.stringify( next ) );
	} catch {
		// Private mode, quota — this tab keeps the record in memory from here on.
		isStorageUsable = false;
	}
}

// Called at account creation, before `/me` has caught up. Records only what the gate can't work
// out later for itself.
export function beginGateAttempt( scope: string ): void {
	write( scope, { isNewSignup: true } );
}

export function isFreshSignupAttempt( scope: string ): boolean {
	return read( scope ).isNewSignup;
}

/**
 * Stamps the gate as shown and reports whether this call was the one that stamped it, so the view
 * event fires once per attempt rather than once per tab.
 */
export function markGateShown( scope: string ): boolean {
	if ( read( scope ).shownAt ) {
		return false;
	}
	write( scope, { shownAt: Date.now() } );
	return true;
}

/**
 * Claims the confirmation, returning how long the attempt took, or null if there is no unfinished
 * attempt to claim — because no gate was shown, or because another tab got there first. Every tab
 * still finishes; only the claimant records the event.
 *
 * The claim stays rather than being removed, so a late tab finds it taken instead of an empty
 * record it would mistake for a fresh attempt.
 */
export function claimGateConfirmation( scope: string ): { secondsOnStep: number } | null {
	const record = read( scope );
	if ( ! record.shownAt || record.confirmedAt ) {
		return null;
	}
	const now = Date.now();
	write( scope, { confirmedAt: now } );
	return { secondsOnStep: Math.round( ( now - record.shownAt ) / 1000 ) };
}

// Persisted so a reload doesn't forget a lockout and reopen the button into a refusal.
export function markResendUnavailableUntil( scope: string, deadline: number ): void {
	write( scope, { resendAvailableAt: deadline } );
}

// 0 when nothing is stored, which is also right when storage is unavailable: nothing claimed.
export function gateResendAvailableAt( scope: string ): number {
	return read( scope ).resendAvailableAt;
}

// For a tab that wants to notice another tab claiming a lockout, via the `storage` event.
export function isGateStorageKey( key: string | null, scope: string ): boolean {
	return key === storageKey( scope );
}
