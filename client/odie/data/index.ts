import { useEffect, useState } from 'react';

type OdieStorageKey = 'chat_id';

const buildOdieStorageKey = ( key: OdieStorageKey ) => `odie_${ key }`;

const storageEventName = 'odieStorageEvent';

export const getOdieStorage = ( key: OdieStorageKey ) => {
	const storageKey = buildOdieStorageKey( key );
	return localStorage.getItem( storageKey );
};

export const setOdieStorage = ( key: OdieStorageKey, value: string ) => {
	const storageKey = buildOdieStorageKey( key );
	localStorage.setItem( storageKey, value );

	const event = new CustomEvent( storageEventName, {
		detail: {
			key: storageKey,
			value: value,
		},
	} );

	window.dispatchEvent( event );
};

export const clearOdieStorage = ( key: OdieStorageKey ) => {
	const storageKey = buildOdieStorageKey( key );
	localStorage.removeItem( storageKey );

	const event = new CustomEvent( storageEventName, {
		detail: {
			key: storageKey,
			value: null,
		},
	} );

	window.dispatchEvent( event );
};

export const useOdieStorage = ( key: OdieStorageKey ) => {
	const storageKey = buildOdieStorageKey( key );
	const [ value, setValue ] = useState( getOdieStorage( key ) );
	useEffect( () => {
		const storageListener = ( e: StorageEvent ) => {
			if ( e.key === storageKey ) {
				setValue( e.newValue );
			}
		};

		const customStorageListener = ( e: Event ) => {
			const detail = ( e as CustomEvent ).detail;
			if ( detail.key === storageKey ) {
				setValue( detail.value );
			}
		};

		window.addEventListener( 'storage', storageListener );
		window.addEventListener( storageEventName, customStorageListener );

		return () => {
			window.removeEventListener( 'storage', storageListener );
			window.removeEventListener( storageEventName, customStorageListener );
		};
	}, [ key, storageKey ] );

	return value;
};
