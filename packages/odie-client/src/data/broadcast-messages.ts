import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useCurrentSupportInteractionId } from './use-current-support-interaction';
import type { Message } from '../types';

const messageEventName = 'odieMessageEvent';
const interactionUpdatedEventName = 'odieInteractionUpdatedEvent';

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

/**
 * Sent when a tab changes the support interaction itself, e.g. escalates it to
 * a Zendesk conversation. Other tabs on the same interaction refetch it so they
 * switch too, instead of staying on the Odie chat.
 */
type OdieInteractionUpdatedData = {
	type: typeof interactionUpdatedEventName;
	odieBroadcastClientId: string;
	supportInteractionId: string;
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

export const broadcastOdieInteractionUpdated = ( origin: string, supportInteractionId: string ) => {
	const bc = new BroadcastChannel( 'odieChannel' );
	bc.postMessage( {
		type: interactionUpdatedEventName,
		odieBroadcastClientId: origin,
		supportInteractionId,
	} satisfies OdieInteractionUpdatedData );
};

export const useOdieBroadcastWithCallbacks = (
	callbacks: { addMessage?: ( message: Message ) => void },
	listenerClientId: string
) => {
	const supportInteractionId = useCurrentSupportInteractionId();
	const queryClient = useQueryClient();

	useEffect( () => {
		const bc = new BroadcastChannel( 'odieChannel' );
		bc.onmessage = ( event ) => {
			const data = event.data as
				| Partial< OdieBroadcastData >
				| Partial< OdieInteractionUpdatedData >
				| undefined;

			// Ignore our own broadcasts.
			if ( ! data || data.odieBroadcastClientId === listenerClientId ) {
				return;
			}

			// Only act on broadcasts for the support interaction this tab is showing.
			if ( ! supportInteractionId || data.supportInteractionId !== supportInteractionId ) {
				return;
			}

			if ( data.type === interactionUpdatedEventName ) {
				// Refetch the interaction so this tab picks up the new conversation, and
				// the Odie chat so the history it rebuilds from is not the stale copy
				// cached before the other tab escalated.
				queryClient.invalidateQueries( {
					queryKey: [
						'support-interactions',
						'get-interaction-by-id',
						supportInteractionId,
						isTestModeEnvironment(),
					],
				} );
				queryClient.invalidateQueries( { queryKey: [ 'odie-chat' ] } );
				return;
			}

			if ( data.type !== messageEventName || ! data.message || ! callbacks.addMessage ) {
				return;
			}

			// The sending tab owns the send lifecycle. Here the message is already on
			// its way, so render it as sent instead of stuck in the greyed "sending"
			// state that a user message without `received` gets.
			const message =
				data.message.role === 'user' && ! data.message.received
					? {
							...data.message,
							received: data.message.metadata?.local_timestamp ?? Date.now() / 1000,
					  }
					: data.message;

			callbacks.addMessage( message );
		};

		return () => {
			bc.close();
		};
	}, [ callbacks, listenerClientId, supportInteractionId, queryClient ] );
};
