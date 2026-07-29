// One session-storage record per gate attempt, keyed by flow and user, so its state
// survives leaving/re-entering the account step or a refresh. The record's presence means
// the gate is pending; resolving removes it. `sentAt` anchors the resend cooldown,
// `shownAt` (stamped when the gate first renders) anchors the duration metric, and
// `pendingEmail` holds the new address after "Update email" (a pending change leaves
// `/me` on the old address, so the gate can't recover the target after a refresh otherwise).

export const RESEND_COOLDOWN_SECONDS = 60;

const STORAGE_KEY = 'onboarding-email-verification-gate';

export function gateScope( flow: string, userId: number | string | null | undefined ): string {
	return `${ flow }:${ userId ?? '' }`;
}

interface GateRecord {
	sentAt: number;
	shownAt: number;
	pendingEmail?: string;
}

function storageKey( scope: string ): string {
	return `${ STORAGE_KEY }:${ scope }`;
}

function read( scope: string ): GateRecord | null {
	try {
		const raw = sessionStorage.getItem( storageKey( scope ) );
		return raw ? ( JSON.parse( raw ) as GateRecord ) : null;
	} catch {
		return null;
	}
}

function write( scope: string, record: GateRecord ): void {
	try {
		sessionStorage.setItem( storageKey( scope ), JSON.stringify( record ) );
	} catch {
		// Ignore storage failures (private mode, quota); the state just won't persist.
	}
}

// Called at email account creation: open the gate and record the activation email as
// the initial send. `shownAt` is filled in later, when the gate first renders.
export function beginGate( scope: string ): void {
	write( scope, { sentAt: Date.now(), shownAt: 0 } );
}

// Stamped when the gate first renders, so the duration metric excludes the token-load and
// user-hydration wait between account creation and the gate.
export function markGateShown( scope: string ): void {
	const record = read( scope );
	if ( record && ! record.shownAt ) {
		write( scope, { ...record, shownAt: Date.now() } );
	}
}

export function isGatePending( scope: string ): boolean {
	return read( scope ) !== null;
}

// Called once the email is confirmed.
export function resolveGate( scope: string ): void {
	try {
		sessionStorage.removeItem( storageKey( scope ) );
	} catch {
		// Ignore storage failures; the in-session state has already moved on.
	}
}

// Called on a successful resend to restart the cooldown.
export function markResent( scope: string ): void {
	const record = read( scope );
	if ( record ) {
		write( scope, { ...record, sentAt: Date.now() } );
	}
}

// Called after "Update email" so the new address (a pending change `/me` won't report)
// survives a refresh, and drives the display, inbox link, and resend target.
export function setPendingEmail( scope: string, email: string ): void {
	const record = read( scope );
	if ( record ) {
		write( scope, { ...record, pendingEmail: email } );
	}
}

export function getPendingEmail( scope: string ): string | undefined {
	return read( scope )?.pendingEmail;
}

export function gateShownAt( scope: string ): number {
	return read( scope )?.shownAt || Date.now();
}

export function gateSentAt( scope: string ): number {
	return read( scope )?.sentAt ?? 0;
}

export function cooldownRemainingSeconds( sentAt: number ): number {
	const remainingMs = RESEND_COOLDOWN_SECONDS * 1000 - ( Date.now() - sentAt );
	return remainingMs > 0 ? Math.min( Math.ceil( remainingMs / 1000 ), RESEND_COOLDOWN_SECONDS ) : 0;
}
