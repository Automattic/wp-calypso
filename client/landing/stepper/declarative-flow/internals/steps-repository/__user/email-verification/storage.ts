// One session-storage record per gate attempt, keyed by flow and user, so the gate survives a
// refresh. The record's presence means the gate is pending; resolving removes it.
// `resendAvailableAt` anchors the resend cooldown, `shownAt` the duration metric.

// Matches the server's own minimum interval, so the button reopens exactly when a resend
// would be accepted. The server remains the authority: when it refuses, it says how long.
export const RESEND_COOLDOWN_SECONDS = 60;

// The server's hourly lockout is the longest wait it can hand back. Anything beyond that is a
// corrupt record rather than a real limit, and must not strand the user on a gate with no skip.
const MAX_COOLDOWN_SECONDS = 60 * 60;

const STORAGE_KEY = 'onboarding-email-verification-gate';

export function gateScope( flow: string, userId: number | string | null | undefined ): string {
	return `${ flow }:${ userId ?? '' }`;
}

interface GateRecord {
	resendAvailableAt: number;
	shownAt: number;
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

// Called at email account creation: open the gate and start the cooldown, since the activation
// email from signup counts as the first send. `shownAt` is filled in when the gate renders.
export function beginGate( scope: string ): void {
	write( scope, { resendAvailableAt: availableIn( RESEND_COOLDOWN_SECONDS ), shownAt: 0 } );
}

// Stamped when the gate first renders, so the duration metric excludes the token-load and
// user-hydration wait before it.
export function markGateShown( scope: string ): void {
	const record = read( scope );
	if ( record && ! record.shownAt ) {
		write( scope, { ...record, shownAt: Date.now() } );
	}
}

export function isGatePending( scope: string ): boolean {
	return read( scope ) !== null;
}

export function resolveGate( scope: string ): void {
	try {
		sessionStorage.removeItem( storageKey( scope ) );
	} catch {
		// Ignore storage failures; the in-session state has already moved on.
	}
}

// Hold the button for `seconds`: the standard interval after a send, or whatever the server
// asked for when it refused one.
export function markResendUnavailableFor( scope: string, seconds: number ): void {
	const record = read( scope );
	if ( record ) {
		write( scope, { ...record, resendAvailableAt: availableIn( seconds ) } );
	}
}

export function gateShownAt( scope: string ): number {
	return read( scope )?.shownAt || Date.now();
}

export function gateResendAvailableAt( scope: string ): number {
	return read( scope )?.resendAvailableAt ?? 0;
}

function availableIn( seconds: number ): number {
	return Date.now() + Math.min( seconds, MAX_COOLDOWN_SECONDS ) * 1000;
}

export function cooldownRemainingSeconds( availableAt: number ): number {
	const remainingMs = availableAt - Date.now();
	return remainingMs > 0 ? Math.min( Math.ceil( remainingMs / 1000 ), MAX_COOLDOWN_SECONDS ) : 0;
}
