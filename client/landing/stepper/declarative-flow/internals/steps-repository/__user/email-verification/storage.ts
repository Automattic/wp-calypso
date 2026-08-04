// One gate attempt, keyed by flow and user. Whether the gate opens is not in here — `/me` answers
// that. This is what an attempt has to remember while it runs, and it lives in local storage
// because the attempt now spans tabs: a lockout the server is enforcing shouldn't look lifted just
// because the flow was reopened elsewhere, and a confirmation shouldn't be recorded once per tab.

const STORAGE_KEY = 'onboarding-email-verification-gate';

export function gateScope( flow: string, userId: number | string | null | undefined ): string {
	return `${ flow }:${ userId ?? '' }`;
}

interface GateRecord {
	// Anchors the TTL. Set by whichever of the two openers runs first.
	startedAt: number;
	// The account was created during this attempt, so an email really was just sent.
	isNewSignup: boolean;
	shownAt: number;
	resendAvailableAt: number;
	// Claimed by the first tab to see the confirmation, so only one of them records it.
	confirmedAt: number;
}

const EMPTY_RECORD: GateRecord = {
	startedAt: 0,
	isNewSignup: false,
	shownAt: 0,
	resendAvailableAt: 0,
	confirmedAt: 0,
};

// An abandoned attempt leaves its record behind. Past this it stops speaking for the next one —
// which is what keeps a signup abandoned days ago from still being told an email was just sent.
const ATTEMPT_TTL_MS = 24 * 60 * 60 * 1000;

function storageKey( scope: string ): string {
	return `${ STORAGE_KEY }:${ scope }`;
}

function read( scope: string ): GateRecord {
	try {
		const raw = localStorage.getItem( storageKey( scope ) );
		if ( ! raw ) {
			return EMPTY_RECORD;
		}
		const record = { ...EMPTY_RECORD, ...( JSON.parse( raw ) as Partial< GateRecord > ) };
		const isSpent =
			Date.now() - record.startedAt > ATTEMPT_TTL_MS && record.resendAvailableAt <= Date.now();
		return isSpent ? EMPTY_RECORD : record;
	} catch {
		return EMPTY_RECORD;
	}
}

function write( scope: string, record: Partial< GateRecord > ): GateRecord {
	const next = { ...read( scope ), ...record };
	next.startedAt = next.startedAt || Date.now();
	try {
		localStorage.setItem( storageKey( scope ), JSON.stringify( next ) );
	} catch {
		// Ignore storage failures (private mode, quota); the state just won't persist.
	}
	return next;
}

// Called at account creation, before `/me` has caught up. Records only what the gate can't work
// out for itself later — that the email it's asking about was sent moments ago.
export function beginGateAttempt( scope: string ): void {
	write( scope, { isNewSignup: true } );
}

// Whether an email was sent during this attempt, as opposed to one the user arrived already
// holding from an earlier signup.
export function isFreshSignupAttempt( scope: string ): boolean {
	return read( scope ).isNewSignup;
}

/**
 * Stamps the gate as shown, for the duration metric, and reports whether this call was the one
 * that stamped it — which is what makes the view event fire once per attempt rather than once per
 * tab or mount.
 *
 * With storage unavailable nothing persists and every call reports true, so a caller falls back to
 * once per mount rather than going silent.
 */
export function markGateShown( scope: string ): boolean {
	if ( read( scope ).shownAt ) {
		return false;
	}
	write( scope, { shownAt: Date.now() } );
	return true;
}

/**
 * Claims the confirmation for this attempt, returning how long it took, or null if another tab
 * claimed it first. Every tab still finishes and moves on; only the claimant records the event.
 *
 * The claim is left in place rather than removed, so a tab arriving late finds it taken instead of
 * an empty record it would mistake for a fresh attempt.
 */
export function claimGateConfirmation( scope: string ): { secondsOnStep: number } | null {
	const record = read( scope );
	if ( record.confirmedAt ) {
		return null;
	}
	const now = Date.now();
	write( scope, { confirmedAt: now } );
	return { secondsOnStep: Math.round( ( now - ( record.shownAt || now ) ) / 1000 ) };
}

// Whether an attempt is still waiting to be finished — the case where someone confirms elsewhere
// and comes back to a `/me` that already reads verified, so the gate never mounts to close it out.
export function hasUnfinishedGateAttempt( scope: string ): boolean {
	const record = read( scope );
	return !! record.shownAt && ! record.confirmedAt;
}

// Persisted so a reload doesn't forget a lockout and reopen the button into a refusal.
export function markResendUnavailableUntil( scope: string, deadline: number ): void {
	write( scope, { resendAvailableAt: deadline } );
}

// 0 when nothing is stored, which is also right when storage is unavailable: nothing claimed.
export function gateResendAvailableAt( scope: string ): number {
	return read( scope ).resendAvailableAt;
}
