// One gate attempt, keyed by flow and user. Whether the gate opens is not in here — `/me` answers
// that. Local rather than session storage because an attempt spans tabs, and a lockout or a
// confirmation counted once per tab is counted wrong.

const STORAGE_KEY = 'onboarding-email-verification-gate';

export function gateScope( flow: string, userId: number | string | null | undefined ): string {
	return `${ flow }:${ userId ?? '' }`;
}

interface GateRecord {
	startedAt: number; // anchors the TTL
	freshUntil: number; // while this hasn't passed, an email really was just sent
	shownAt: number;
	resendAvailableAt: number;
	confirmedAt: number; // claimed by one tab, so only that one records the confirmation
}

const EMPTY_RECORD: GateRecord = {
	startedAt: 0,
	freshUntil: 0,
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

function persist( scope: string, record: GateRecord ): void {
	memoryRecords.set( scope, record );
	try {
		localStorage.setItem( storageKey( scope ), JSON.stringify( record ) );
	} catch {
		// Private mode, quota — this tab keeps the record in memory from here on.
		isStorageUsable = false;
	}
}

function read( scope: string ): GateRecord {
	let stored: Partial< GateRecord > | undefined;
	if ( isStorageUsable ) {
		try {
			const raw = localStorage.getItem( storageKey( scope ) );
			stored = raw ? ( JSON.parse( raw ) as Partial< GateRecord > ) : undefined;
		} catch {
			isStorageUsable = false;
		}
	}

	const remembered = memoryRecords.get( scope );
	if ( ! stored && remembered ) {
		// Gone from under this tab: resolving a different user than the one last stored clears
		// browser storage wholesale, which would otherwise reopen a live lockout, count the view
		// again and lose the confirmation. This tab still knows its own attempt, so put it back.
		persist( scope, remembered );
		stored = remembered;
	}
	return hydrate( stored );
}

function write( scope: string, record: Partial< GateRecord > ): void {
	const next = { ...read( scope ), ...record };
	next.startedAt = next.startedAt || Date.now();
	persist( scope, next );
}

// How long "we just sent an email" stays true. Long enough to cover a signup that detours through
// checkout, short enough that someone who abandoned this morning isn't told it after lunch — which
// the attempt's own day-long life is far too generous for.
const FRESH_SIGNUP_WINDOW_MS = 30 * 60 * 1000;

// Called at account creation, before `/me` has caught up. On the shared record rather than this
// tab's own, so every tab tells the user the same thing and the view event agrees with the copy.
export function markFreshSignup( scope: string ): void {
	write( scope, { freshUntil: Date.now() + FRESH_SIGNUP_WINDOW_MS } );
}

export function isFreshSignup( scope: string ): boolean {
	return read( scope ).freshUntil > Date.now();
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
