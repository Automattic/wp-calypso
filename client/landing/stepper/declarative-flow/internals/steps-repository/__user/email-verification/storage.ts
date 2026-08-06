// One gate attempt, keyed by flow and user. Whether the gate opens is not in here — `/me` answers
// that. Local rather than session storage because an attempt spans tabs, and session storage is
// copied into a duplicated tab and restored with a reopened one, so an attempt kept there would be
// inherited by tabs that would each go on to claim it.

const STORAGE_KEY = 'onboarding-email-verification-gate';

export function gateScope( flow: string, userId: number | string | null | undefined ): string {
	return `${ flow }:${ userId ?? '' }`;
}

interface GateRecord {
	shownAt: number; // when the gate first appeared, which is also when the attempt began
	resendAvailableAt: number;
	confirmedAt: number; // claimed by one tab, so only that one records the confirmation
}

const EMPTY_RECORD: GateRecord = { shownAt: 0, resendAvailableAt: 0, confirmedAt: 0 };

// Past this an abandoned attempt stops speaking for the next one.
const ATTEMPT_TTL_MS = 24 * 60 * 60 * 1000;

// What this tab has written. Storage can refuse a write outright, and can be cleared underneath a
// tab mid-attempt, either of which would otherwise cost this tab the stamp its own confirmation
// has to find.
const written = new Map< string, GateRecord >();

function storageKey( scope: string ): string {
	return `${ STORAGE_KEY }:${ scope }`;
}

function stored( scope: string ): GateRecord | null {
	try {
		const raw = localStorage.getItem( storageKey( scope ) );
		return raw ? { ...EMPTY_RECORD, ...( JSON.parse( raw ) as Partial< GateRecord > ) } : null;
	} catch {
		return null;
	}
}

// Empty once an attempt is old enough to have nothing left to say, so an abandoned one stops
// speaking for the next.
function unspent( record: GateRecord | null | undefined ): GateRecord {
	if ( ! record ) {
		return EMPTY_RECORD;
	}
	const isSpent =
		Date.now() - record.shownAt > ATTEMPT_TTL_MS && record.resendAvailableAt <= Date.now();
	return isSpent ? EMPTY_RECORD : record;
}

// What every tab has put in, with what this one wrote filling in whatever storage no longer has.
// Each is aged out on its own: an attempt this tab started is live whatever it is sitting on top
// of, and merging first would let a stale timestamp age out the record that replaced it.
function read( scope: string ): GateRecord {
	const theirs = unspent( stored( scope ) );
	const mine = unspent( written.get( scope ) );
	return {
		// Both stamps are set once and then left, so either copy having one is the answer.
		shownAt: theirs.shownAt || mine.shownAt,
		confirmedAt: theirs.confirmedAt || mine.confirmedAt,
		// The one field that gets rewritten, so the lockout still running is the later of the two.
		resendAvailableAt: Math.max( theirs.resendAvailableAt, mine.resendAvailableAt ),
	};
}

function write( scope: string, changes: Partial< GateRecord > ): void {
	const next = { ...read( scope ), ...changes };
	written.set( scope, next );
	try {
		localStorage.setItem( storageKey( scope ), JSON.stringify( next ) );
	} catch {
		// This tab can still finish the attempt on what it remembers writing.
	}
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
 * Read-check-write is three operations and local storage gives no atomicity between documents, so
 * two tabs acting within a few microseconds of each other can both find the attempt unclaimed. The
 * check makes that rare rather than impossible, which is what the rest of Stepper lives with for
 * its own step events. The claim stays rather than being cleared, so a late tab finds it taken
 * instead of an empty record it would mistake for a fresh attempt.
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

// Persisted so a reload doesn't forget a lockout and reopen the button into a refusal. Only ever
// extends: a wait the server is still enforcing mustn't be shortened by a later, smaller one.
export function markResendUnavailableUntil( scope: string, deadline: number ): void {
	if ( deadline > read( scope ).resendAvailableAt ) {
		write( scope, { resendAvailableAt: deadline } );
	}
}

export function gateResendAvailableAt( scope: string ): number {
	return read( scope ).resendAvailableAt;
}
