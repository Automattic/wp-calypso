// One gate attempt, keyed by flow and user. Whether the gate opens is not in here — `/me` answers
// that. Local rather than session storage because an attempt spans tabs, and a lockout or a
// confirmation counted once per tab is counted wrong.

const STORAGE_KEY = 'onboarding-email-verification-gate';

export function gateScope( flow: string, userId: number | string | null | undefined ): string {
	return `${ flow }:${ userId ?? '' }`;
}

interface GateRecord {
	startedAt: number; // anchors the TTL
	shownAt: number;
	resendAvailableAt: number;
	confirmedAt: number; // claimed by one tab, so only that one records the confirmation
}

const EMPTY_RECORD: GateRecord = { startedAt: 0, shownAt: 0, resendAvailableAt: 0, confirmedAt: 0 };

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

	const shared = hydrate( stored );
	if ( shared.startedAt ) {
		// Snapshot whatever is shared, another tab's writes included — a tab that only ever reads
		// an attempt would otherwise have nothing to put back, and one that wrote to it earlier
		// would put back its own older copy.
		memoryRecords.set( scope, shared );
		return shared;
	}

	// Resolving a different user than the one last stored clears browser storage wholesale, which
	// would reopen a live lockout, recount the view and lose the confirmation.
	const remembered = hydrate( memoryRecords.get( scope ) );
	if ( remembered.startedAt ) {
		persist( scope, remembered );
		return remembered;
	}
	return EMPTY_RECORD;
}

/**
 * Every mutation, in one place.
 *
 * Read-check-write is three operations and local storage gives no atomicity between documents, so
 * two tabs acting on the same attempt within a few microseconds of each other can both find it
 * untouched. The check makes that rare rather than impossible — which is what the rest of Stepper
 * lives with for its own step events. `mutate` returning null leaves the record alone.
 */
function updateGateRecord< T >(
	scope: string,
	mutate: ( record: GateRecord ) => { changes: Partial< GateRecord > | null; result: T }
): T {
	const record = read( scope );
	const { changes, result } = mutate( record );
	if ( changes ) {
		persist( scope, { ...record, ...changes, startedAt: record.startedAt || Date.now() } );
	}
	return result;
}

/**
 * Stamps the gate as shown and reports whether this call was the one that stamped it, so the view
 * event fires once per attempt rather than once per tab.
 */
export function markGateShown( scope: string ): boolean {
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
export function claimGateConfirmation( scope: string ): { secondsOnStep: number } | null {
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
export function markResendUnavailableUntil( scope: string, deadline: number ): void {
	updateGateRecord( scope, () => ( {
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
