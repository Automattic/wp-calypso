import { useEffect, useState } from 'react';
import { Message } from '../types';

type OdieStorageKey = 'chat_id' | 'last_chat_id';

const buildOdieStorageKey = ( key: OdieStorageKey ) => `odie_${ key }`;

const storageEventName = 'odieStorageEvent';
const messageEventName = 'odieMessageEvent';
const clearChatEventName = 'clearChatEvent';

export const getOdieStorage = ( key: OdieStorageKey ) => {
	const storageKey = buildOdieStorageKey( key );
	return localStorage.getItem( storageKey );
};

export const setOdieStorage = ( key: OdieStorageKey, value: string ) => {
	const storageKey = buildOdieStorageKey( key );
	localStorage.setItem( storageKey, value );

	// Duplicate the value to last_chat_id
	if ( key === 'chat_id' ) {
		localStorage.setItem( buildOdieStorageKey( 'last_chat_id' ), value );
		window.dispatchEvent(
			new CustomEvent( storageEventName, {
				detail: {
					key: buildOdieStorageKey( 'last_chat_id' ),
					value: value,
				},
			} )
		);
	}

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

export const broadcastOdieMessage = ( message: Message, origin: string ) => {
	const bc = new BroadcastChannel( 'odieChannel' );
	bc.postMessage( {
		type: messageEventName,
		message,
		odieClientId: origin,
	} );
};

export const broadcastChatClearance = ( origin: string ) => {
	const bc = new BroadcastChannel( 'odieChannel' );
	bc.postMessage( {
		type: clearChatEventName,
		odieClientId: origin,
	} );
};

export const useOdieBroadcastWithCallbacks = (
	callbacks: { addMessage?: ( message: Message ) => void; clearChat?: () => void },
	listenerClientId: string
) => {
	useEffect( () => {
		const bc = new BroadcastChannel( 'odieChannel' );
		bc.onmessage = ( event ) => {
			const odieClientId = event.data.odieClientId;
			if ( listenerClientId !== odieClientId ) {
				if ( event.data.type === messageEventName && callbacks.addMessage ) {
					callbacks.addMessage( event.data.message );
				} else if ( event.data.type === clearChatEventName && callbacks.clearChat ) {
					callbacks.clearChat();
				}
			}
		};

		return () => {
			bc.close();
		};
	}, [ callbacks, listenerClientId ] );
};
