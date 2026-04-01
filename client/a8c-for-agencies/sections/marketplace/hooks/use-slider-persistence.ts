import { useState, useCallback } from 'react';

const STORAGE_KEY_PREFIX = 'a4a-marketplace-slider-';

type SliderPersistenceOptions< T > = {
	key: string;
	defaultValue: T;
	serialize?: ( value: T ) => string;
	deserialize?: ( value: string ) => T;
};

/**
 * Hook for persisting slider values across tab switches using sessionStorage.
 * Values are cleared when the browser session ends.
 */
export default function useSliderPersistence< T >( {
	key,
	defaultValue,
	serialize = ( v ) => String( v ),
	deserialize = ( v ) => v as unknown as T,
}: SliderPersistenceOptions< T > ): [ T, ( value: T ) => void ] {
	const storageKey = STORAGE_KEY_PREFIX + key;

	const [ value, setValue ] = useState< T >( () => {
		try {
			const stored = sessionStorage.getItem( storageKey );
			if ( stored !== null ) {
				return deserialize( stored );
			}
		} catch {
			// sessionStorage might not be available
		}
		return defaultValue;
	} );

	const setPersistedValue = useCallback(
		( newValue: T ) => {
			try {
				sessionStorage.setItem( storageKey, serialize( newValue ) );
			} catch {
				// sessionStorage might not be available
			}
			setValue( newValue );
		},
		[ storageKey, serialize ]
	);

	return [ value, setPersistedValue ];
}
