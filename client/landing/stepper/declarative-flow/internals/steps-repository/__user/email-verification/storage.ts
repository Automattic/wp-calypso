import {
	cooldownDeadline,
	RESEND_MIN_INTERVAL_SECONDS,
} from 'calypso/lib/email-verification/resend';

// One session-storage record per gate attempt, keyed by flow and user, so the gate survives a
// refresh. The record's presence means the gate is pending; resolving removes it.
// `resendAvailableAt` anchors the resend cooldown, `shownAt` the duration metric.

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
	write( scope, {
		resendAvailableAt: cooldownDeadline( RESEND_MIN_INTERVAL_SECONDS ),
		shownAt: 0,
	} );
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

// Remember a cooldown so it survives a reload — a server lockout would otherwise be forgotten
// and the button would reopen into a refusal.
export function markResendUnavailableUntil( scope: string, deadline: number ): void {
	const record = read( scope );
	if ( record ) {
		write( scope, { ...record, resendAvailableAt: deadline } );
	}
}

export function gateShownAt( scope: string ): number {
	return read( scope )?.shownAt || Date.now();
}

export function gateResendAvailableAt( scope: string ): number {
	return read( scope )?.resendAvailableAt ?? 0;
}
