const STORAGE_KEY = 'reader-fediverse-oauth-state';

export interface FediverseOauthState {
	state: string;
	blog_id: number;
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

export function saveOauthState( value: FediverseOauthState ): void {
	const storage = getStorage();
	if ( ! storage ) {
		return;
	}
	try {
		storage.setItem( STORAGE_KEY, JSON.stringify( value ) );
	} catch ( err ) {
		// sessionStorage can throw in private-mode or when the quota is
		// exceeded. Save is best-effort; the callback view will detect
		// the missing stored state and surface a retry prompt. Log so
		// the failure mode is visible in the browser console rather
		// than disappearing silently.
		// eslint-disable-next-line no-console
		console.error( 'Fediverse OAuth state save failed:', err );
	}
}

export function loadOauthState(): FediverseOauthState | null {
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
			typeof ( parsed as FediverseOauthState ).state === 'string' &&
			typeof ( parsed as FediverseOauthState ).blog_id === 'number'
		) {
			return parsed as FediverseOauthState;
		}
		return null;
	} catch ( err ) {
		// eslint-disable-next-line no-console
		console.error( 'Fediverse OAuth state load failed:', err );
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
