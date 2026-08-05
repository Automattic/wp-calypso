// What one gate attempt has to remember, keyed by flow and user. Whether the gate opens is not in
// here — `/me` answers that. Session storage, so a tab keeps its attempt across a reload and takes
// it with it when it closes: a view and a confirmation are counted once per tab, the way the rest
// of Stepper counts its own step events.

const STORAGE_KEY = 'onboarding-email-verification-gate';

export function gateScope( flow: string, userId: number | string | null | undefined ): string {
	return `${ flow }:${ userId ?? '' }`;
}

interface GateRecord {
	shownAt: number;
	resendAvailableAt: number;
	confirmedAt: number;
}

const EMPTY_RECORD: GateRecord = { shownAt: 0, resendAvailableAt: 0, confirmedAt: 0 };

function storageKey( scope: string ): string {
	return `${ STORAGE_KEY }:${ scope }`;
}

function read( scope: string ): GateRecord {
	try {
		const raw = sessionStorage.getItem( storageKey( scope ) );
		return raw
			? { ...EMPTY_RECORD, ...( JSON.parse( raw ) as Partial< GateRecord > ) }
			: EMPTY_RECORD;
	} catch {
		return EMPTY_RECORD;
	}
}

function write( scope: string, changes: Partial< GateRecord > ): void {
	try {
		sessionStorage.setItem(
			storageKey( scope ),
			JSON.stringify( { ...read( scope ), ...changes } )
		);
	} catch {
		// Ignore storage failures (private mode, quota); the state just won't survive a reload.
	}
}

/**
 * Stamps the gate as shown and reports whether this call was the one that stamped it, so the view
 * event fires once for an attempt rather than once per mount of it.
 */
export function markGateShown( scope: string ): boolean {
	if ( read( scope ).shownAt ) {
		return false;
	}
	write( scope, { shownAt: Date.now() } );
	return true;
}

/**
 * Claims the confirmation, returning how long the attempt took, or null if there is nothing to
 * claim — because no gate was shown, or because it has already been recorded.
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
