import { useEffect } from 'react';
import { useCurrentSupportInteractionId } from './use-current-support-interaction';
import type { Message } from '../types';

const messageEventName = 'odieMessageEvent';

type OdieBroadcastData = {
	type: typeof messageEventName;
	message: Message;
	odieBroadcastClientId: string;
	/**
	 * The support interaction the sending tab is showing, or `null` when it has
	 * none yet. Receivers only accept messages for the interaction they show, so
	 * a message never leaks into a different chat open in another tab (DOTSUP-470).
	 */
	supportInteractionId: string | null;
};

export const broadcastOdieMessage = (
	message: Message,
	origin: string,
	supportInteractionId: string | null
) => {
	const bc = new BroadcastChannel( 'odieChannel' );
	bc.postMessage( {
		type: messageEventName,
		message,
		odieBroadcastClientId: origin,
		supportInteractionId,
	} satisfies OdieBroadcastData );
};

export const useOdieBroadcastWithCallbacks = (
	callbacks: { addMessage?: ( message: Message ) => void },
	listenerClientId: string
) => {
	const supportInteractionId = useCurrentSupportInteractionId();

	useEffect( () => {
		const bc = new BroadcastChannel( 'odieChannel' );
		bc.onmessage = ( event ) => {
			const data = event.data as Partial< OdieBroadcastData > | undefined;

			if ( data?.type !== messageEventName || ! data.message || ! callbacks.addMessage ) {
				return;
			}

			// Ignore our own broadcasts.
			if ( data.odieBroadcastClientId === listenerClientId ) {
				return;
			}

			// Only accept messages for the support interaction this tab is showing.
			if ( ! supportInteractionId || data.supportInteractionId !== supportInteractionId ) {
				return;
			}

			callbacks.addMessage( data.message );
		};

		return () => {
			bc.close();
		};
	}, [ callbacks, listenerClientId, supportInteractionId ] );
};
