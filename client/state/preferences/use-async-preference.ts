import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';
import { savePreference } from 'calypso/state/preferences/actions';
import { getPreference, hasReceivedRemotePreferences } from 'calypso/state/preferences/selectors';

interface UseAsyncPreferenceOptions< T > {
	defaultValue: T;
	preferenceName: string;
}

export const useAsyncPreference = < T extends string >( {
	defaultValue,
	preferenceName,
}: UseAsyncPreferenceOptions< T > ) => {
	const store = useStore();
	const dispatch = useDispatch();
	const remotePreferencesLoaded = useSelector( hasReceivedRemotePreferences );

	const [ localValue, setLocalValue ] = useState< T | 'none' >( () => {
		if ( ! remotePreferencesLoaded ) {
			return 'none';
		}

		return getPreference( store.getState(), preferenceName ) ?? defaultValue;
	} );

	useEffect( () => {
		if ( remotePreferencesLoaded ) {
			setLocalValue( getPreference( store.getState(), preferenceName ) ?? defaultValue );
		}
	}, [ remotePreferencesLoaded, store, preferenceName, defaultValue ] );

	const setValue = useCallback(
		( newValue: T ) => {
			setLocalValue( newValue );
			dispatch( savePreference( preferenceName, newValue ) );
		},
		[ dispatch, preferenceName ]
	);

	return [ localValue, setValue ] as const;
};
