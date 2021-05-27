/**
 * External dependencies
 */
import { useCallback, useRef, useState } from 'react';

export function useLocalStorage< T >(
	storageKey: string,
	initialValue: T | ( () => T )
): [ T, ( newValue: T | ( ( oldValue: T ) => T ) ) => void ] {
	const [ storedValue, setStoredValue ] = useState( () => {
		const item = typeof window === 'undefined' ? null : window.localStorage.getItem( storageKey );
		if ( item !== null ) {
			try {
				return JSON.parse( item ) as T;
			} catch {
				// Invalid data stored in localStorage, return initialValue
			}
		}

		return initialValue instanceof Function ? initialValue() : initialValue;
	} );

	const prevValue = useRef( storedValue );

	const setValue = useCallback(
		( newValue: T | ( ( oldValue: T ) => T ) ) => {
			const valueToStore = newValue instanceof Function ? newValue( prevValue.current ) : newValue;
			setStoredValue( valueToStore );
			prevValue.current = valueToStore;
			if ( typeof window !== 'undefined' ) {
				window.localStorage.setItem( storageKey, JSON.stringify( valueToStore ) );
			}
		},
		[ prevValue, storageKey ]
	);

	return [ storedValue, setValue ];
}
