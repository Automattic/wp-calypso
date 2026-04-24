const STORAGE_KEY = 'reader.mastodon.oauthState';

export interface StoredOauthState {
	state: string;
	instance: string;
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

export function saveOauthState( value: StoredOauthState ): void {
	const storage = getStorage();
	if ( ! storage ) {
		return;
	}
	try {
		storage.setItem( STORAGE_KEY, JSON.stringify( value ) );
	} catch {
		// sessionStorage can throw in private-mode or when the quota is
		// exceeded. Save is best-effort; if it fails, the callback view
		// will detect the missing stored state and surface a retry
		// prompt rather than silently continuing.
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
			typeof parsed === 'object' &&
			parsed !== null &&
			typeof ( parsed as StoredOauthState ).state === 'string' &&
			typeof ( parsed as StoredOauthState ).instance === 'string'
		) {
			return parsed as StoredOauthState;
		}
		return null;
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
