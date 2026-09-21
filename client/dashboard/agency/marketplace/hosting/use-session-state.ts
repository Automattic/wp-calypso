import { useCallback, useSyncExternalStore } from 'react';

// Same sessionStorage keys as the classic marketplace, so a selection made on
// one dashboard is still there on the other.
const VALUE_KEY_PREFIX = 'a4a-marketplace-slider-';
const MAP_KEY_PREFIX = 'a4a-marketplace-keyed-';

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

/** A map of values persisted per key (e.g. the chosen plan per plan tab). */
export function useKeyedSessionState< T >( storageKey: string ) {
	const fullKey = MAP_KEY_PREFIX + storageKey;
	const stored = useSyncExternalStore(
		useCallback( ( listener: () => void ) => subscribe( fullKey, listener ), [ fullKey ] ),
		() => readStorage( fullKey )
	);

	const readMap = useCallback( (): Record< string, string > => {
		try {
			return JSON.parse( stored ?? '{}' );
		} catch {
			return {};
		}
	}, [ stored ] );

	const getValue = useCallback(
		( key: string ): T | null => {
			const map = readMap();
			if ( ! ( key in map ) ) {
				return null;
			}
			try {
				return JSON.parse( map[ key ] ) as T;
			} catch {
				return null;
			}
		},
		[ readMap ]
	);

	const setValue = useCallback(
		( key: string, value: T ) => {
			writeStorage( fullKey, JSON.stringify( { ...readMap(), [ key ]: JSON.stringify( value ) } ) );
		},
		[ fullKey, readMap ]
	);

	return { getValue, setValue };
}
