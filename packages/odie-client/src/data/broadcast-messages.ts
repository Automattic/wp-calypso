import { isTestModeEnvironment } from '@automattic/zendesk-client';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useCurrentSupportInteractionId } from './use-current-support-interaction';
import { getSupportInteractionQueryKey } from './use-get-support-interaction-by-id';
import type { Message } from '../types';

const messageEventName = 'odieMessageEvent';
const interactionUpdatedEventName = 'odieInteractionUpdatedEvent';

type OdieBroadcastData = {
	type: typeof messageEventName;
	/**
	 * Crosses tabs through structured clone, so `content` has to be plain text:
	 * a React element makes `postMessage` throw a `DataCloneError`. Every sender
	 * passes plain text today (user input, Odie replies, the built-in notices).
	 */
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
	/**
	 * The interaction the sending tab started from. Other tabs are showing this
	 * one, so it is what they match on.
	 */
	supportInteractionId: string;
	/**
	 * The interaction that owns the conversation now. Usually the same, but the
	 * support interaction service can move the event onto another interaction;
	 * tabs on the original then follow the sending tab there.
	 */
	updatedSupportInteractionId: string;
};

const postToOdieChannel = ( data: OdieBroadcastData | OdieInteractionUpdatedData ) => {
	const bc = new BroadcastChannel( 'odieChannel' );
	bc.postMessage( data );
	// The message is already queued for the other tabs; nothing else goes out on this channel.
	bc.close();
};

export const broadcastOdieMessage = (
	message: Message,
	origin: string,
	supportInteractionId: string | null
) => {
	postToOdieChannel( {
		type: messageEventName,
		message,
		odieBroadcastClientId: origin,
		supportInteractionId,
	} );
};

export const broadcastOdieInteractionUpdated = (
	origin: string,
	supportInteractionId: string,
	updatedSupportInteractionId: string = supportInteractionId
) => {
	postToOdieChannel( {
		type: interactionUpdatedEventName,
		odieBroadcastClientId: origin,
		supportInteractionId,
		updatedSupportInteractionId,
	} );
};

export const useOdieBroadcastWithCallbacks = (
	callbacks: { addMessage?: ( message: Message ) => void },
	listenerClientId: string
) => {
	const supportInteractionId = useCurrentSupportInteractionId();
	const queryClient = useQueryClient();
	const location = useLocation();
	const navigate = useNavigate();

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
				const isTestMode = isTestModeEnvironment();
				const updatedSupportInteractionId =
					data.updatedSupportInteractionId ?? supportInteractionId;

				// Refetch the interaction so this tab picks up the new conversation, and
				// the Odie chat so the history it rebuilds from is not the stale copy
				// cached before the other tab escalated.
				queryClient.invalidateQueries( {
					queryKey: getSupportInteractionQueryKey( supportInteractionId, isTestMode ),
				} );
				queryClient.invalidateQueries( { queryKey: [ 'odie-chat' ] } );

				if ( updatedSupportInteractionId !== supportInteractionId ) {
					// The conversation ended up on another interaction. Follow the sending
					// tab there; the one this tab shows will never get the conversation.
					queryClient.invalidateQueries( {
						queryKey: getSupportInteractionQueryKey( updatedSupportInteractionId, isTestMode ),
					} );
					const params = new URLSearchParams( location.search );
					params.set( 'id', updatedSupportInteractionId );
					navigate( `${ location.pathname }?${ params.toString() }`, { replace: true } );
				}
				return;
			}

			if ( data.type !== messageEventName || ! data.message || ! callbacks.addMessage ) {
				return;
			}

			// The sending tab owns the send lifecycle. A Zendesk user message (the only
			// kind carrying `temporary_id`) renders greyed as "sending" until `received`
			// is set, and only the sending tab ever sets it. The message is already on
			// its way here, so stamp it and render it as sent.
			const message =
				data.message.role === 'user' &&
				data.message.metadata?.temporary_id &&
				! data.message.received
					? {
							...data.message,
							received: data.message.metadata.local_timestamp ?? Date.now() / 1000,
					  }
					: data.message;

			callbacks.addMessage( message );
		};

		return () => {
			bc.close();
		};
	}, [
		callbacks,
		listenerClientId,
		supportInteractionId,
		queryClient,
		navigate,
		location.pathname,
		location.search,
	] );
};
