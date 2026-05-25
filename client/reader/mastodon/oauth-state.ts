const STORAGE_KEY = 'reader.mastodon.oauthState';

export interface StoredOauthState {
	state: string;
	instance: string;
	// Internal path to navigate to once the callback view finishes the OAuth
	// handshake. Only honored when it parses as a single-leading-slash path
	// (no protocol-relative `//evil.example/foo` or absolute URLs). Absent for
	// fresh-connect flows; the callback view falls back to the timeline route
	// for the just-created connection in that case.
	returnPath?: string;
	// When set, the callback view treats a successful complete() as a
	// reconnect of this existing connection: prime auth-status to
	// `needs_reauth: false`, fire the reconnected success notice, and emit
	// `calypso_reader_reauth_completed`. Mismatch with the connection id the
	// backend echoes back is a soft fall-through to the fresh-connect path —
	// we don't surface an error to the user.
	reconnectingConnectionId?: number;
}

function getStorage(): Storage | null {
	if ( typeof window === 'undefined' ) {
		return null;
	}
	try {
		return window.sessionStorage;
	} catch {
		return null;
	}
}

// Returns true when the value was persisted, false when sessionStorage was
// unavailable (private-mode, quota exceeded, security policy, …). Callers
// MUST check the return value before redirecting to the IdP — a `false` here
// means the callback view won't be able to validate `state` on return, so the
// reconnect can't safely proceed.
export function saveOauthState( value: StoredOauthState ): boolean {
	const storage = getStorage();
	if ( ! storage ) {
		return false;
	}
	try {
		storage.setItem( STORAGE_KEY, JSON.stringify( value ) );
		return true;
	} catch {
		return false;
	}
}

export function readOauthState(): StoredOauthState | null {
	const storage = getStorage();
	if ( ! storage ) {
		return null;
	}
	try {
		const raw = storage.getItem( STORAGE_KEY );
		if ( ! raw ) {
			return null;
		}
		const parsed = JSON.parse( raw ) as unknown;
		if (
			typeof parsed !== 'object' ||
			parsed === null ||
			typeof ( parsed as StoredOauthState ).state !== 'string' ||
			typeof ( parsed as StoredOauthState ).instance !== 'string'
		) {
			return null;
		}
		const candidate = parsed as Record< string, unknown >;
		const result: StoredOauthState = {
			state: candidate.state as string,
			instance: candidate.instance as string,
		};
		// Only carry the optional fields when they're the right shape.
		// Anything else is treated as absent — never throw on a malformed
		// stored value, since the callback view can still complete OAuth
		// without the optional reconnect hints.
		if ( typeof candidate.returnPath === 'string' && isSafeReturnPath( candidate.returnPath ) ) {
			result.returnPath = candidate.returnPath;
		}
		if (
			typeof candidate.reconnectingConnectionId === 'number' &&
			Number.isInteger( candidate.reconnectingConnectionId ) &&
			candidate.reconnectingConnectionId > 0
		) {
			result.reconnectingConnectionId = candidate.reconnectingConnectionId;
		}
		return result;
	} catch {
		return null;
	}
}

export function clearOauthState(): void {
	const storage = getStorage();
	if ( ! storage ) {
		return;
	}
	try {
		storage.removeItem( STORAGE_KEY );
	} catch {
		// Best-effort cleanup; if storage is unavailable, there is nothing
		// to clear anyway.
	}
}

// Reject anything that isn't a single-leading-slash internal path. Protocol-
// relative `//evil.example/foo` and absolute `https://…` would otherwise flow
// into a `page.replace()` call. The check runs both at write time
// (caller-side, before save) and read time (defence in depth) so a
// hand-edited storage value can't smuggle an external URL through to
// navigation.
//
// Also reject backslash-prefixed (`/\evil.example`, which some browsers
// normalise to `//evil.example`) and any path containing whitespace.
// Legitimate Reader paths URL-encode whitespace and control bytes; raw
// bytes only appear when something has tampered with the stored value.
export function isSafeReturnPath( path: string ): boolean {
	if ( ! path.startsWith( '/' ) ) {
		return false;
	}
	if ( path.startsWith( '//' ) || path.startsWith( '/\\' ) ) {
		return false;
	}
	if ( /\s/.test( path ) ) {
		return false;
	}
	return true;
}
