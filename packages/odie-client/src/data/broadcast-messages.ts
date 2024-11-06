import { useEffect } from 'react';
import type { Message } from '../types';

const messageEventName = 'odieMessageEvent';
const clearChatEventName = 'clearChatEvent';

export const broadcastOdieMessage = ( message: Message, origin: string ) => {
	const bc = new BroadcastChannel( 'odieChannel' );
	bc.postMessage( {
		type: messageEventName,
		message,
		odieBroadcastClientId: origin,
	} );
};

export const broadcastChatClearance = ( origin: string ) => {
	const bc = new BroadcastChannel( 'odieChannel' );
	bc.postMessage( {
		type: clearChatEventName,
		odieBroadcastClientId: origin,
	} );
};

export const useOdieBroadcastWithCallbacks = (
	callbacks: { addMessage?: ( message: Message ) => void; clearChat?: () => void },
	listenerClientId: string
) => {
	useEffect( () => {
		const bc = new BroadcastChannel( 'odieChannel' );
		bc.onmessage = ( event ) => {
			const odieBroadcastClientId = event.data.odieBroadcastClientId;
			if ( listenerClientId !== odieBroadcastClientId ) {
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
