// One session-storage record per gate attempt, keyed by flow and user, so the gate survives a
// refresh. The record's presence means the gate is pending; resolving removes it.

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

// Called at email account creation. No cooldown is claimed: signup's activation email doesn't go
// through the throttled path, so the server would accept a resend right away.
export function beginGate( scope: string ): void {
	write( scope, { resendAvailableAt: 0, shownAt: 0 } );
}

/**
 * Stamps the gate as shown, so the duration metric excludes the token-load and user-hydration
 * wait before it, and reports whether this call was the one that stamped it — which is what
 * makes a per-gate event fire once rather than once per mount.
 *
 * True when nothing is stored, so a caller isn't silenced by unavailable storage; it falls back
 * to once per mount rather than never.
 */
export function markGateShown( scope: string ): boolean {
	const record = read( scope );
	if ( ! record ) {
		return true;
	}
	if ( record.shownAt ) {
		return false;
	}
	write( scope, { ...record, shownAt: Date.now() } );
	return true;
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

// Persisted so a reload doesn't forget a lockout and reopen the button into a refusal.
export function markResendUnavailableUntil( scope: string, deadline: number ): void {
	const record = read( scope );
	if ( record ) {
		write( scope, { ...record, resendAvailableAt: deadline } );
	}
}

export function gateShownAt( scope: string ): number {
	return read( scope )?.shownAt || Date.now();
}

// 0 when nothing is stored, which is also right when storage is unavailable: nothing claimed.
export function gateResendAvailableAt( scope: string ): number {
	return read( scope )?.resendAvailableAt ?? 0;
}
