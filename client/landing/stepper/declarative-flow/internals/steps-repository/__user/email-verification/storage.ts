// One session-storage record for the email-verification gate, keyed by flow and user,
// so its state survives leaving/re-entering the account step or a refresh:
//   - pending: this attempt created an email account and hasn't confirmed/skipped yet.
//   - sentAt:  when the (initial or resent) verification email was sent — the cooldown anchor.
//   - shownAt: when the gate first rendered — the duration anchor, so the metric excludes
//              the account-creation → gate loading time and is correct even after a refresh.

export const RESEND_COOLDOWN_SECONDS = 60;

const STORAGE_KEY = 'onboarding-email-verification-gate';

export function gateScope( flow: string, userId: number | string | undefined ): string {
	return `${ flow }:${ userId ?? '' }`;
}

interface GateRecord {
	pending: boolean;
	sentAt: number;
	shownAt: number;
}

function read( scope: string ): GateRecord | null {
	try {
		const raw = sessionStorage.getItem( `${ STORAGE_KEY }:${ scope }` );
		return raw ? ( JSON.parse( raw ) as GateRecord ) : null;
	} catch {
		return null;
	}
}

function write( scope: string, record: GateRecord ): void {
	try {
		sessionStorage.setItem( `${ STORAGE_KEY }:${ scope }`, JSON.stringify( record ) );
	} catch {
		// Ignore storage failures (private mode, quota); the state just won't persist.
	}
}

// Called at email account creation: open the gate and record the activation email as
// the initial send. `shownAt` is filled in later, when the gate first renders.
export function beginGate( scope: string ): void {
	write( scope, { pending: true, sentAt: Date.now(), shownAt: 0 } );
}

// Called when the gate first renders, so the duration metric excludes the time spent
// loading the token and hydrating the current user between account creation and the gate.
export function markGateShown( scope: string ): void {
	const record = read( scope );
	if ( record && ! record.shownAt ) {
		write( scope, { ...record, shownAt: Date.now() } );
	}
}

export function isGatePending( scope: string ): boolean {
	return read( scope )?.pending === true;
}

// Called on confirm or skip.
export function resolveGate( scope: string ): void {
	const record = read( scope );
	if ( record ) {
		write( scope, { ...record, pending: false } );
	}
}

// Called on a successful resend to restart the cooldown.
export function markResent( scope: string ): void {
	const record = read( scope );
	if ( record ) {
		write( scope, { ...record, sentAt: Date.now() } );
	}
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
