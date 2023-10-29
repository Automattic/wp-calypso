import { useEffect, useState } from 'react';

type OdieStorageKey = 'chat_id';

const buildOdieStorageKey = ( key: OdieStorageKey ) => `odie_${ key }`;

export const getOdieStorage = ( key: OdieStorageKey ) => {
	const storageKey = buildOdieStorageKey( key );
	return localStorage.getItem( storageKey );
};

export const setOdieStorage = ( key: OdieStorageKey, value: string ) => {
	localStorage.setItem( buildOdieStorageKey( key ), value );
};

export const clearOdieStorage = ( key: OdieStorageKey ) => {
	localStorage.removeItem( buildOdieStorageKey( key ) );
};

export const useOdieStorage = ( key: OdieStorageKey ) => {
	const [ value, setValue ] = useState( getOdieStorage( key ) );
	useEffect( () => {
		const storageListener = ( e: StorageEvent ) => {
			if ( e.key === buildOdieStorageKey( key ) ) {
				setValue( e.newValue );
			}
		};
		window.addEventListener( 'storage', storageListener );
		return () => {
			window.removeEventListener( 'storage', storageListener );
		};
	}, [ key ] );
	return value;
};
