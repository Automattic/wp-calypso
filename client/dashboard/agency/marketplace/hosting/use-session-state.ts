import { useCallback, useSyncExternalStore } from 'react';

// Same sessionStorage keys as the classic marketplace, so a selection made on
// one dashboard is still there on the other.
const VALUE_KEY_PREFIX = 'a4a-marketplace-slider-';

const listeners = new Map< string, Set< () => void > >();

function readStorage( key: string ): string | null {
	try {
		return sessionStorage.getItem( key );
	} catch {
		return null;
	}
}

function writeStorage( key: string, value: string ) {
	try {
		sessionStorage.setItem( key, value );
	} catch {
		// sessionStorage may be unavailable; subscribers are still notified.
	}
	listeners.get( key )?.forEach( ( listener ) => listener() );
}

function subscribe( key: string, listener: () => void ) {
	if ( ! listeners.has( key ) ) {
		listeners.set( key, new Set() );
	}
	listeners.get( key )?.add( listener );
	return () => {
		listeners.get( key )?.delete( listener );
	};
}

/**
 * State that survives tab switches and reloads for the session. Every
 * consumer of the same key sees the same value.
 */
export function useSessionState< T >(
	key: string,
	defaultValue: T,
	deserialize: ( stored: string ) => T = ( stored ) => stored as unknown as T
): [ T, ( value: T ) => void ] {
	const storageKey = VALUE_KEY_PREFIX + key;
	const stored = useSyncExternalStore(
		useCallback( ( listener: () => void ) => subscribe( storageKey, listener ), [ storageKey ] ),
		() => readStorage( storageKey )
	);
	const value = stored === null ? defaultValue : deserialize( stored );

	const setSessionValue = useCallback(
		( next: T ) => writeStorage( storageKey, String( next ) ),
		[ storageKey ]
	);

	return [ value, setSessionValue ];
}
