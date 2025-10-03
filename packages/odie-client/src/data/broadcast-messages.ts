import { useEffect } from 'react';
import type { Message } from '../types';

const messageEventName = 'odieMessageEvent';

export const broadcastOdieMessage = ( message: Message, origin: string ) => {
	const bc = new BroadcastChannel( 'odieChannel' );
	bc.postMessage( {
		type: messageEventName,
		message,
		odieBroadcastClientId: origin,
	} );
};

export const useOdieBroadcastWithCallbacks = (
	callbacks: { addMessage?: ( message: Message ) => void },
	listenerClientId: string
) => {
	useEffect( () => {
		const bc = new BroadcastChannel( 'odieChannel' );
		bc.onmessage = ( event ) => {
			const odieBroadcastClientId = event.data.odieBroadcastClientId;
			if ( listenerClientId !== odieBroadcastClientId ) {
				if ( event.data.type === messageEventName && callbacks.addMessage ) {
					callbacks.addMessage( event.data.message );
				}
			}
		};

		return () => {
			bc.close();
		};
	}, [ callbacks, listenerClientId ] );
};
