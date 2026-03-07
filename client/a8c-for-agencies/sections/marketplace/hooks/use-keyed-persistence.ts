import { useState, useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY_PREFIX = 'a4a-marketplace-keyed-';

type KeyedPersistenceOptions< T > = {
	storageKey: string;
	currentKey: string;
	defaultValue: T;
};

/**
 * Hook for persisting values per-key (e.g., per-tab) using sessionStorage.
 * When the currentKey changes, the hook returns the stored value for that key.
 * Values are cleared when the browser session ends.
 *
 * Returns: [value, setValue, getValueForKey]
 * - value: The current value for currentKey
 * - setValue: Setter that persists to sessionStorage
 * - getValueForKey: Synchronous getter for any key (useful in effects)
 */
export default function useKeyedPersistence< T >( {
	storageKey,
	currentKey,
	defaultValue,
}: KeyedPersistenceOptions< T > ): [ T, ( value: T ) => void, ( key: string ) => T ] {
	const fullStorageKey = STORAGE_KEY_PREFIX + storageKey;
	const isInitialMount = useRef( true );

	// Read the map from sessionStorage
	const readMap = useCallback( (): Record< string, string > => {
		try {
			const stored = sessionStorage.getItem( fullStorageKey );
			if ( stored ) {
				return JSON.parse( stored );
			}
		} catch {
			// sessionStorage might not be available or JSON parse failed
		}
		return {};
	}, [ fullStorageKey ] );

	// Write the map to sessionStorage
	const writeMap = useCallback(
		( map: Record< string, string > ) => {
			try {
				sessionStorage.setItem( fullStorageKey, JSON.stringify( map ) );
			} catch {
				// sessionStorage might not be available
			}
		},
		[ fullStorageKey ]
	);

	// Get value for current key, or default
	const getValueForKey = useCallback(
		( key: string ): T => {
			const map = readMap();
			if ( key in map ) {
				try {
					return JSON.parse( map[ key ] ) as T;
				} catch {
					// JSON parse failed
				}
			}
			return defaultValue;
		},
		[ readMap, defaultValue ]
	);

	const [ value, setValue ] = useState< T >( () => getValueForKey( currentKey ) );

	// When currentKey changes, load the value for that key
	useEffect( () => {
		if ( isInitialMount.current ) {
			isInitialMount.current = false;
			return;
		}
		setValue( getValueForKey( currentKey ) );
	}, [ currentKey, getValueForKey ] );

	// Setter that persists to sessionStorage
	const setPersistedValue = useCallback(
		( newValue: T ) => {
			const map = readMap();
			map[ currentKey ] = JSON.stringify( newValue );
			writeMap( map );
			setValue( newValue );
		},
		[ currentKey, readMap, writeMap ]
	);

	return [ value, setPersistedValue, getValueForKey ];
}
