import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useGetUnreadConversations } from '@automattic/odie-client/src/data';
import { useQueryClient, QueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useState } from '@wordpress/element';
import Smooch from 'smooch';
import {
	useLoadZendeskMessaging,
	useAuthenticateZendeskMessaging,
	fetchMessagingAuth,
	isTestModeEnvironment,
	SMOOCH_INTEGRATION_ID,
	SMOOCH_INTEGRATION_ID_STAGING,
} from '..';
import {
	convertZendeskMessageToAgentticFormat,
	getClientId,
	getZendeskConversations,
} from './util';
import type { ZendeskMessage } from '@automattic/odie-client';

type Conversation = Awaited< ReturnType< typeof Smooch.getConversationById > >;

const destroy = () => {
	try {
		Smooch.destroy();
	} catch ( error ) {
		// eslint-disable-next-line no-console
		console.error( 'Error destroying Smooch', error );
	}
};

const initSmooch = (
	{
		jwt,
		externalId,
	}: {
		isLoggedIn: boolean;
		jwt: string;
		externalId: string | undefined;
	},
	queryClient: QueryClient
) => {
	const isTestMode = isTestModeEnvironment();

	return Smooch.init( {
		integrationId: isTestMode ? SMOOCH_INTEGRATION_ID_STAGING : SMOOCH_INTEGRATION_ID,
		delegate: {
			async onInvalidAuth() {
				recordTracksEvent( 'calypso_smooch_messenger_auth_error' );

				await queryClient.invalidateQueries( {
					queryKey: [ 'getMessagingAuth', 'zendesk', isTestMode ],
				} );
				const authData = await queryClient.fetchQuery( {
					queryKey: [ 'getMessagingAuth', 'zendesk', isTestMode ],
					queryFn: () => fetchMessagingAuth( 'zendesk' ),
				} );

				return authData.jwt;
			},
		},
		embedded: true,
		soundNotificationEnabled: false,
		externalId,
		jwt,
	} );
};

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

export const useZendeskChat = ( enabled: boolean, conversationId?: string ) => {
	const queryClient = useQueryClient();
	const [ isChatLoaded, setIsChatLoaded ] = useState( false );
	const [ conversation, setConversation ] = useState< Conversation | undefined >( undefined );
	const [ typingStatus, setTypingStatus ] = useState< Record< string, boolean > >( {} );
	const [ clientId, setClientId ] = useState< string | undefined >( undefined );
	const [ connectionStatus, setConnectionStatus ] = useState<
		'connected' | 'disconnected' | 'reconnecting' | undefined
	>( undefined );

	const { data: authData } = useAuthenticateZendeskMessaging( enabled, 'messenger' );

	const { isMessagingScriptLoaded } = useLoadZendeskMessaging( enabled, enabled );

	const getUnreadNotifications = useGetUnreadConversations();

	const getUnreadListener = useCallback(
		( message: ZendeskMessage, data: { conversation: { id: string } } ) => {
			playNotificationSound();
			Smooch.getConversationById( data?.conversation?.id ).then( ( conversation ) => {
				setConversation( conversation );
				getUnreadNotifications();
			} );
		},
		[ getUnreadNotifications ]
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

	const clientIdListener = useCallback(
		( message: ZendeskMessage ) => {
			if ( message?.source?.type === 'web' && message.source?.id ) {
				setClientId( message.source?.id );
				// Unregister the listener after setting the client ID
				// @ts-expect-error -- 'off' is not part of the def.
				Smooch?.off?.( 'message:sent', clientIdListener );
			}
		},
		[ setClientId ]
	);

	// Initialize Smooch which communicates with Zendesk
	useEffect( () => {
		if (
			! isMessagingScriptLoaded ||
			! authData?.isLoggedIn ||
			! authData?.jwt ||
			! authData?.externalId ||
			! enabled
		) {
			return;
		}

		let retryTimeout: ReturnType< typeof setTimeout > | undefined;

		const initializeSmooch = async () => {
			return initSmooch( authData, queryClient )
				.then( () => {
					setIsChatLoaded( true );
					recordTracksEvent( 'calypso_smooch_messenger_init', {
						success: true,
						error: '',
					} );
				} )
				.catch( ( error ) => {
					setIsChatLoaded( false );
					retryTimeout = setTimeout( initializeSmooch, 30000 );
					recordTracksEvent( 'calypso_smooch_messenger_init', {
						success: false,
						error: error.message,
					} );
				} );
		};

		initializeSmooch().then( () => {
			if ( conversationId ) {
				Smooch.getConversationById( conversationId ).then( setConversation );
			} else {
				Smooch.createConversation( {
					metadata: {
						createdAt: Date.now(),
					},
				} ).then( setConversation );
			}
		} );

		Smooch.render( smoochContainer );

		return () => {
			clearTimeout( retryTimeout );
			destroy();
		};
	}, [ isMessagingScriptLoaded, authData, setIsChatLoaded, queryClient, enabled, conversationId ] );

	const agnetticMessages = useMemo( () => {
		return conversation?.messages.map( convertZendeskMessageToAgentticFormat ) ?? [];
	}, [ conversation?.messages ] );

	useEffect( () => {
		if ( isChatLoaded && getZendeskConversations ) {
			const allConversations = getZendeskConversations();
			getUnreadNotifications( allConversations );
			setClientId( getClientId( allConversations ) );
			Smooch.on( 'message:received', getUnreadListener );
			Smooch.on( 'message:sent', clientIdListener );
			Smooch.on( 'disconnected', disconnectedListener );
			Smooch.on( 'reconnecting', reconnectingListener );
			Smooch.on( 'connected', connectedListener );
			Smooch.on( 'typing:start', typingStartListener );
			Smooch.on( 'typing:stop', typingStopListener );
		}

		return () => {
			// @ts-expect-error -- 'off' is not part of the def.
			Smooch?.off?.( 'message:received', getUnreadListener );
			// @ts-expect-error -- 'off' is not part of the def.
			Smooch?.off?.( 'message:sent', clientIdListener );
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
		getUnreadListener,
		setConnectionStatus,
		clientIdListener,
		isChatLoaded,
		typingStartListener,
		typingStopListener,
		getUnreadNotifications,
		disconnectedListener,
		reconnectingListener,
		connectedListener,
	] );

	return {
		isChatLoaded,
		typingStatus,
		clientId,
		conversation,
		connectionStatus,
		agnetticMessages,
		sendMessage: ( message: ZendeskMessage ) => {
			if ( conversation?.id ) {
				setConversation( ( conversation ) => ( {
					...conversation,
					messages: [ ...conversation.messages, message ],
				} ) );
				Smooch.sendMessage( message, conversation.id ).then( () => {
					// Smooch.getConversationById( conversation.id ).then( setConversation );
				} );
			}
		},
	};
};

export default useZendeskChat;
