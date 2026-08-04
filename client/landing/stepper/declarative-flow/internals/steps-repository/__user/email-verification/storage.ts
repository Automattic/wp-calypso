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

// A tab's own copy, so an attempt survives storage being unavailable or cleared underneath it.
// Cross-tab agreement is best-effort in that state; this tab's own accounting still adds up.
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
		// Resolving a different user than the one last stored clears browser storage wholesale,
		// which would reopen a live lockout, recount the view and lose the confirmation.
		persist( scope, remembered );
		stored = remembered;
	}
	return hydrate( stored );
}

/**
 * Every mutation, serialized across tabs.
 *
 * Read-check-write is three operations, and local storage gives no atomicity between documents, so
 * two tabs opening the gate or seeing the same confirmation could both find the record untouched
 * and both act on it. Web Locks makes the sequence exclusive; `mutate` returning null leaves the
 * record alone. Callers keep navigation outside this — every tab still continues either way.
 *
 * Without Web Locks the sequence is unguarded and the counting is best-effort, as it was before.
 */
async function updateGateRecord< T >(
	scope: string,
	mutate: ( record: GateRecord ) => { changes: Partial< GateRecord > | null; result: T }
): Promise< T > {
	const transition = () => {
		const record = read( scope );
		const { changes, result } = mutate( record );
		if ( changes ) {
			persist( scope, { ...record, ...changes, startedAt: record.startedAt || Date.now() } );
		}
		return result;
	};

	if ( ! navigator.locks ) {
		return transition();
	}
	return navigator.locks.request( `${ STORAGE_KEY }:${ scope }`, transition );
}

// How long "we just sent an email" stays true: long enough for a signup that detours through
// checkout, short enough that someone returning hours later isn't told it.
const FRESH_SIGNUP_WINDOW_MS = 30 * 60 * 1000;

// On the shared record rather than one tab's own, so every tab says the same thing and the view
// event agrees with the copy.
export function markFreshSignup( scope: string ): Promise< void > {
	return updateGateRecord( scope, () => ( {
		changes: { freshUntil: Date.now() + FRESH_SIGNUP_WINDOW_MS },
		result: undefined,
	} ) );
}

export function isFreshSignup( scope: string ): boolean {
	return read( scope ).freshUntil > Date.now();
}

/**
 * Stamps the gate as shown and reports whether this call was the one that stamped it, so the view
 * event fires once per attempt rather than once per tab.
 */
export function markGateShown( scope: string ): Promise< boolean > {
	return updateGateRecord( scope, ( record ) =>
		record.shownAt
			? { changes: null, result: false }
			: { changes: { shownAt: Date.now() }, result: true }
	);
}

/**
 * Claims the confirmation, returning how long the attempt took, or null if there is no unfinished
 * attempt to claim — because no gate was shown, or because another tab got there first. Every tab
 * still finishes; only the claimant records the event.
 *
 * The claim stays rather than being removed, so a late tab finds it taken instead of an empty
 * record it would mistake for a fresh attempt.
 */
export function claimGateConfirmation(
	scope: string
): Promise< { secondsOnStep: number } | null > {
	return updateGateRecord( scope, ( record ) => {
		if ( ! record.shownAt || record.confirmedAt ) {
			return { changes: null, result: null };
		}
		const now = Date.now();
		return {
			changes: { confirmedAt: now },
			result: { secondsOnStep: Math.round( ( now - record.shownAt ) / 1000 ) },
		};
	} );
}

// Persisted so a reload doesn't forget a lockout and reopen the button into a refusal.
export function markResendUnavailableUntil( scope: string, deadline: number ): Promise< void > {
	return updateGateRecord( scope, () => ( {
		changes: { resendAvailableAt: deadline },
		result: undefined,
	} ) );
}

// 0 when nothing is stored, which is also right when storage is unavailable: nothing claimed.
export function gateResendAvailableAt( scope: string ): number {
	return read( scope ).resendAvailableAt;
}

// For a tab that wants to notice another tab claiming a lockout, via the `storage` event.
export function isGateStorageKey( key: string | null, scope: string ): boolean {
	return key === storageKey( scope );
}
