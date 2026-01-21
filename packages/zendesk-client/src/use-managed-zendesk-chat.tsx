import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { useLocation, useNavigate } from 'react-router-dom';
import SmoochLibrary from 'smooch';
import { SMOOCH_INTEGRATION_ID, SMOOCH_INTEGRATION_ID_STAGING } from './constants';
import { ZendeskConversation } from './types';
import {
	useAuthenticateZendeskMessaging,
	fetchMessagingAuth,
} from './use-authenticate-zendesk-messaging';
import { useLoadZendeskMessaging } from './use-load-zendesk-messaging';
import { isTestModeEnvironment, convertZendeskMessageToAgentticFormat } from './util';
import type { ZendeskMessage } from './types';

// const destroy = () => {
// 	try {
// 		Smooch.destroy();
// 	} catch ( error ) {
// 		// eslint-disable-next-line no-console
// 		console.error( 'Error destroying Smooch', error );
// 	}
// };

function useSmooch( jwt?: string, externalId?: string ) {
	const queryClient = useQueryClient();
	const { isMessagingScriptLoaded } = useLoadZendeskMessaging( true, false );
	console.log( { jwt, externalId } );

	return useQuery< typeof SmoochLibrary, Error, typeof SmoochLibrary, string[] >( {
		queryKey: [ 'smooch', jwt, externalId ],
		queryFn: () => {
			console.log( 'useSmooch' );
			const isTestMode = isTestModeEnvironment();
			return SmoochLibrary.init( {
				integrationId: isTestMode ? SMOOCH_INTEGRATION_ID_STAGING : SMOOCH_INTEGRATION_ID,
				delegate: {
					async onInvalidAuth() {
						recordTracksEvent( 'calypso_smooch_messenger_auth_error' );

						await queryClient.invalidateQueries( {
							queryKey: [ 'getMessagingAuth', 'zendesk', isTestMode ],
						} );
						const authData = await queryClient.fetchQuery( {
							queryKey: [ 'getMessagingAuth', 'zendesk', isTestMode, false ],
							queryFn: () => fetchMessagingAuth( 'zendesk' ),
						} );

						return authData.jwt;
					},
				},
				embedded: true,
				soundNotificationEnabled: false,
				externalId,
				jwt,
			} )
				.then( () => {
					debugger;
					return SmoochLibrary;
				} )
				.catch( ( error ) => {
					debugger;
					return error;
				} );
		},
		staleTime: Infinity,
		enabled: !! jwt && isMessagingScriptLoaded && !! externalId,
		meta: {
			persist: false,
		},
	} );
}

const playNotificationSound = () => {
	// @ts-expect-error expected because of fallback webkitAudioContext
	const audioContext = new ( window.AudioContext || window.webkitAudioContext )();

	const duration = 0.7;
	const oscillator = audioContext.createOscillator();
	const gainNode = audioContext.createGain();

	// Configure oscillator
	oscillator.type = 'sine';
	oscillator.frequency.setValueAtTime( 660, audioContext.currentTime );

	// Configure gain for a smoother fade-out
	gainNode.gain.setValueAtTime( 0.3, audioContext.currentTime );
	gainNode.gain.exponentialRampToValueAtTime( 0.001, audioContext.currentTime + duration );

	// Connect & start
	oscillator.connect( gainNode );
	gainNode.connect( audioContext.destination );
	oscillator.start();
	oscillator.stop( audioContext.currentTime + duration );
};

const smoochContainer = document.createElement( 'div' );
smoochContainer.style.display = 'none';
smoochContainer.style.position = 'absolute';
smoochContainer.style.top = '0';
smoochContainer.style.left = '0';
smoochContainer.style.width = '100%';
smoochContainer.style.height = '100%';
smoochContainer.style.zIndex = '1000';
document.body.appendChild( smoochContainer );

/**
 * Returns a complete API for managing a Zendesk chat.
 * @param enabled - Whether the chat is enabled.
 * @returns An object with the following properties:
 * - typingStatus: The status of the typing.
 * - clientId: The ID of the client.
 * - conversation: The conversation.
 * - connectionStatus: The status of the connection.
 * - agentticMessages: The messages in the conversation in Agenttic-compatible format.
 * - sendMessage: A function to send a message to the conversation.
 */
export const useManagedZendeskChat = ( enabled: boolean ) => {
	const location = useLocation();
	const conversationId = new URLSearchParams( location.search ).get( 'conversationId' );
	const [ conversation, setConversation ] = useState< ZendeskConversation | undefined >();
	const [ typingStatus, setTypingStatus ] = useState< Record< string, boolean > >( {} );
	const [ connectionStatus, setConnectionStatus ] = useState<
		'connected' | 'disconnected' | 'reconnecting' | undefined
	>( undefined );

	const { data: authData } = useAuthenticateZendeskMessaging( enabled, 'zendesk' );
	const { data: Smooch } = useSmooch( authData?.jwt, authData?.externalId );

	console.log( { Smooch } );

	const disconnectedListener = useCallback( () => {
		setConnectionStatus( 'disconnected' );
		recordTracksEvent( 'calypso_smooch_messenger_disconnected' );
	}, [ setConnectionStatus ] );

	const reconnectingListener = useCallback( () => {
		setConnectionStatus( 'reconnecting' );
		recordTracksEvent( 'calypso_smooch_messenger_reconnecting' );
	}, [ setConnectionStatus ] );

	const typingStartListener = useCallback(
		( { conversation }: ConversationData ) => {
			setTypingStatus( ( typingStatus ) => ( { ...typingStatus, [ conversation.id ]: true } ) );
		},
		[ setTypingStatus ]
	);
	const typingStopListener = useCallback(
		( { conversation }: ConversationData ) => {
			setTypingStatus( ( typingStatus ) => ( { ...typingStatus, [ conversation.id ]: false } ) );
		},
		[ setTypingStatus ]
	);

	const connectedListener = useCallback( () => {
		// We only want to revert the connection status to connected if it was disconnected before.
		// We don't want a "connected" status on page load, it's only useful as a sign of a recovered connection.
		if ( connectionStatus ) {
			setConnectionStatus( 'connected' );
			recordTracksEvent( 'calypso_smooch_messenger_connected' );
		}
	}, [ setConnectionStatus, connectionStatus ] );

	const navigate = useNavigate();

	// Initialize Smooch which communicates with Zendesk
	useEffect( () => {
		if ( ! Smooch || conversation ) {
			return;
		}

		// Smooch.render( smoochContainer );

		if ( conversationId ) {
			debugger;
			Smooch.getConversationById( conversationId ).then( setConversation );
			Smooch.loadConversation( conversationId );
		} else {
			Smooch.createConversation( {
				metadata: {
					createdAt: Date.now(),
				},
			} ).then( ( conversation ) => {
				setConversation( conversation );
				const params = new URLSearchParams( location.search );
				params.set( 'conversationId', conversation.id );
				navigate( `${ location.pathname }?${ params.toString() }`, { replace: true } );
				Smooch.loadConversation( conversation.id );
			} );
		}
	}, [
		Smooch,
		conversationId,
		location.pathname,
		location.search,
		navigate,
		conversation,
		Smooch?.render,
	] );

	const agentticMessages = useMemo( () => {
		return conversation?.messages.map( convertZendeskMessageToAgentticFormat ) ?? [];
	}, [ conversation?.messages ] );

	useEffect( () => {
		if ( Smooch ) {
			Smooch.on( 'disconnected', disconnectedListener );
			Smooch.on( 'reconnecting', reconnectingListener );
			Smooch.on( 'connected', connectedListener );
			Smooch.on( 'typing:start', typingStartListener );
			Smooch.on( 'typing:stop', typingStopListener );
		}

		return () => {
			// @ts-expect-error -- 'off' is not part of the def.
			Smooch?.off?.( 'disconnected', disconnectedListener );
			// @ts-expect-error -- 'off' is not part of the def.
			Smooch?.off?.( 'reconnecting', reconnectingListener );
			// @ts-expect-error -- 'off' is not part of the def.
			Smooch?.off?.( 'connected', connectedListener );
			// @ts-expect-error -- 'off' is not part of the def.
			Smooch?.off?.( 'typing:stop', typingStopListener );
			// @ts-expect-error -- 'off' is not part of the def.
			Smooch?.off?.( 'typing:start', typingStartListener );
		};
	}, [
		setConnectionStatus,
		typingStartListener,
		typingStopListener,
		//getUnreadNotifications,
		disconnectedListener,
		reconnectingListener,
		connectedListener,
		Smooch,
	] );

	return {
		typingStatus,
		conversation,
		connectionStatus,
		agentticMessages,
		onSubmit: ( message: string ) => {
			const messageToSend: ZendeskMessage = {
				type: 'text',
				text: message,
				role: 'user',
				id: crypto.randomUUID(),
				received: Date.now(),
			};
			if ( conversation?.id ) {
				// Todo: mark the message as `is_sending`.
				setConversation( {
					...conversation,
					messages: [ ...conversation.messages, messageToSend ],
				} );
				// Todo: mark the message as sent after the following resolves.
				Smooch.sendMessage( messageToSend, conversation.id );
			}
		},
	};
};

export default useManagedZendeskChat;
