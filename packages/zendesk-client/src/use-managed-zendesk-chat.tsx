import { ThinkingMessage } from '@automattic/agenttic-ui';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useLocation, useNavigate } from 'react-router-dom';
import SmoochLibrary from 'smooch';
import { SMOOCH_INTEGRATION_ID, SMOOCH_INTEGRATION_ID_STAGING } from './constants';
import { ZendeskConversation } from './types';
import {
	useAuthenticateZendeskMessaging,
	fetchMessagingAuth,
} from './use-authenticate-zendesk-messaging';
import { isTestModeEnvironment, convertZendeskMessageToAgentticFormat } from './util';
import type { ZendeskMessage } from './types';

type ConversationData = {
	conversation: {
		id: string;
	};
};

let smoochContainer: HTMLDivElement | null = null;

function getSmoochContainer(): HTMLDivElement | null {
	if ( typeof document === 'undefined' ) {
		return null;
	}

	const existing = document.querySelector< HTMLDivElement >( '.smooch-container' );
	if ( existing ) {
		smoochContainer = existing;
	} else if ( ! smoochContainer ) {
		smoochContainer = document.createElement( 'div' );
		smoochContainer.className = 'smooch-container';
	}

	// Keep the container hidden since we're using embedded mode.
	smoochContainer.style.display = 'none';
	smoochContainer.style.position = 'absolute';
	smoochContainer.style.top = '0';
	smoochContainer.style.left = '0';
	smoochContainer.style.width = '100%';
	smoochContainer.style.height = '100%';
	smoochContainer.style.zIndex = '1000';

	if ( ! document.body.contains( smoochContainer ) ) {
		document.body.appendChild( smoochContainer );
	}

	return smoochContainer;
}

function useSmooch( enabled = true ) {
	const queryClient = useQueryClient();
	const { data: authData, isFetching: isAuthenticatingZendeskMessaging } =
		useAuthenticateZendeskMessaging( enabled, 'zendesk', false );
	const jwt = authData?.jwt;
	const externalId = authData?.externalId;

	const smoochQuery = useQuery( {
		queryKey: [ 'smooch', jwt, externalId ],
		queryFn: () => {
			const isTestMode = isTestModeEnvironment();
			const container = getSmoochContainer();
			if ( ! container ) {
				throw new Error( 'Smooch container is unavailable.' );
			}

			SmoochLibrary.render( container );
			return SmoochLibrary.init( {
				integrationId: isTestMode ? SMOOCH_INTEGRATION_ID_STAGING : SMOOCH_INTEGRATION_ID,
				delegate: {
					async onInvalidAuth() {
						recordTracksEvent( 'calypso_smooch_messenger_auth_error' );

						await queryClient.invalidateQueries( {
							queryKey: [ 'getMessagingAuth', 'zendesk', isTestMode, false ],
						} );
						const authData = await queryClient.fetchQuery( {
							queryKey: [ 'getMessagingAuth', 'zendesk', isTestMode, false ],
							queryFn: () => fetchMessagingAuth( 'zendesk', false ),
						} );

						return authData.jwt;
					},
				},
				embedded: true,
				soundNotificationEnabled: false,
				externalId,
				jwt,
			} ).then( () => {
				return SmoochLibrary;
			} );
		},
		staleTime: Infinity,
		enabled: !! jwt && !! externalId && enabled,
		meta: {
			persist: false,
		},
	} );

	return { ...smoochQuery, isLoading: isAuthenticatingZendeskMessaging || smoochQuery.isFetching };
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
/**
 * Returns a complete API for managing a Zendesk chat.
 * @returns An object with the following properties:
 * - typingStatus: The status of the typing.
 * - clientId: The ID of the client.
 * - conversation: The conversation.
 * - connectionStatus: The status of the connection.
 * - agentticMessages: The messages in the conversation in Agenttic-compatible format.
 * - sendMessage: A function to send a message to the conversation.
 */
export const useManagedZendeskChat = () => {
	const { state } = useLocation();
	const conversationId = state?.conversationId;
	const [ conversation, setConversation ] = useState< ZendeskConversation | undefined >();
	const [ typingStatus, setTypingStatus ] = useState< Record< string, boolean > >( {} );
	const [ connectionStatus, setConnectionStatus ] = useState<
		'connected' | 'disconnected' | 'reconnecting' | undefined
	>( undefined );

	const { data: Smooch, isLoading: isSettingUpSmooch } = useSmooch();

	const getUnreadListener = useCallback(
		( message: ZendeskMessage, data: { conversation: { id: string } } ) => {
			if ( data.conversation.id === conversation?.id ) {
				playNotificationSound();
				Smooch?.getConversationById( data.conversation.id ).then( setConversation );
				//Smooch?.loadConversation( data.conversation.id );
			}
		},
		[ Smooch, setConversation, conversation?.id ]
	);

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

	useEffect( () => {
		if ( ! Smooch || conversation ) {
			return;
		}

		if ( conversationId ) {
			Smooch.getConversationById( conversationId ).then( setConversation );
			Smooch.loadConversation( conversationId );
		} else {
			Smooch.createConversation( {
				metadata: {
					createdAt: Date.now(),
				},
			} ).then( ( conversation ) => {
				setConversation( conversation );
				navigate( '/zendesk', { state: { conversationId: conversation.id }, replace: true } );
				Smooch.loadConversation( conversation.id );
			} );
		}
	}, [ Smooch, conversationId, navigate, conversation, Smooch?.render ] );

	const currentTypingStatus = typingStatus[ conversation?.id ?? '' ];

	const agentticMessages = useMemo( () => {
		const messages = conversation?.messages.map( convertZendeskMessageToAgentticFormat ) ?? [];
		if ( currentTypingStatus ) {
			return [
				...messages,
				{
					id: 'thinking_message_' + messages.length,
					role: 'agent',
					content: [
						{
							type: 'component',
							component: () => (
								<div className="agents-manager-typing-placeholder">
									<ThinkingMessage content={ __( 'Typing…', '__i18n_text_domain__' ) } />
								</div>
							),
						},
					],
				},
			];
		}
		return messages;
	}, [ conversation, currentTypingStatus ] );

	useEffect( () => {
		if ( Smooch ) {
			Smooch.on( 'message:received', getUnreadListener );
			Smooch.on( 'disconnected', disconnectedListener );
			Smooch.on( 'reconnecting', reconnectingListener );
			Smooch.on( 'connected', connectedListener );
			Smooch.on( 'typing:start', typingStartListener );
			Smooch.on( 'typing:stop', typingStopListener );

			return () => {
				// @ts-expect-error -- 'off' is not part of the def.
				Smooch.off?.( 'message:received', getUnreadListener );
				// @ts-expect-error -- 'off' is not part of the def.
				Smooch.off?.( 'disconnected', disconnectedListener );
				// @ts-expect-error -- 'off' is not part of the def.
				Smooch.off?.( 'reconnecting', reconnectingListener );
				// @ts-expect-error -- 'off' is not part of the def.
				Smooch.off?.( 'connected', connectedListener );
				// @ts-expect-error -- 'off' is not part of the def.
				Smooch.off?.( 'typing:stop', typingStopListener );
				// @ts-expect-error -- 'off' is not part of the def.
				Smooch.off?.( 'typing:start', typingStartListener );
			};
		}
	}, [
		setConnectionStatus,
		typingStartListener,
		typingStopListener,
		getUnreadListener,
		//getUnreadNotifications,
		disconnectedListener,
		reconnectingListener,
		connectedListener,
		Smooch,
	] );

	return {
		typingStatus,
		isProcessing: isSettingUpSmooch,
		conversation,
		connectionStatus,
		agentticMessages,
		isLoadingConversation: isSettingUpSmooch || ! conversation,
		onTypingStatusChange: ( typingStatus: boolean ) => {
			if ( typingStatus ) {
				Smooch?.startTyping( conversation?.id );
			} else {
				Smooch?.stopTyping( conversation?.id );
			}
		},
		onSubmit: ( message: string ) => {
			const messageToSend = {
				type: 'text',
				text: message,
			};
			if ( conversation?.id && Smooch ) {
				setConversation( {
					...conversation,
					messages: [ ...conversation.messages, messageToSend as ZendeskMessage ],
				} );
				Smooch.sendMessage( messageToSend, conversation.id );
			}
		},
	};
};

export const useGetZendeskConversations = ( enabled: boolean ) => {
	const { data: Smooch, isLoading: isSettingUpSmooch } = useSmooch( enabled );
	return { conversations: Smooch?.getConversations() ?? [], isLoading: isSettingUpSmooch };
};
