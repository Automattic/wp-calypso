import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterSelect } from '@automattic/data-stores';
import { useGetUnreadConversations } from '@automattic/odie-client/src/data';
import {
	useLoadZendeskMessaging,
	useAuthenticateZendeskMessaging,
	fetchMessagingAuth,
	isTestModeEnvironment,
	SMOOCH_INTEGRATION_ID,
	SMOOCH_INTEGRATION_ID_STAGING,
	useCanConnectToZendeskMessaging,
} from '@automattic/zendesk-client';
import { useQueryClient, QueryClient } from '@tanstack/react-query';
import { useSelect, useDispatch } from '@wordpress/data';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import Smooch from 'smooch';
import { useChatStatus } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { getClientId, getZendeskConversations } from './utils';
import type { ZendeskMessage } from '@automattic/odie-client';

const destroy = () => {
	Smooch.destroy();
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

const HelpCenterSmooch: React.FC< { enableAuth: boolean } > = ( { enableAuth } ) => {
	const { isEligibleForChat } = useChatStatus();
	const queryClient = useQueryClient();
	const smoochRef = useRef< HTMLDivElement >( null );
	const { data: canConnectToZendesk } = useCanConnectToZendeskMessaging();
	const {
		isHelpCenterShown,
		isChatLoaded,
		areSoundNotificationsEnabled,
		hasPremiumSupport,
		connectionStatus,
	} = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			isHelpCenterShown: helpCenterSelect.isHelpCenterShown(),
			isChatLoaded: helpCenterSelect.getIsChatLoaded(),
			areSoundNotificationsEnabled: helpCenterSelect.getAreSoundNotificationsEnabled(),
			hasPremiumSupport: helpCenterSelect.getHasPremiumSupport(),
			connectionStatus: helpCenterSelect.getZendeskConnectionStatus(),
		};
	}, [] );

	const allowChat = canConnectToZendesk && enableAuth && ( isEligibleForChat || hasPremiumSupport );

	const { data: authData } = useAuthenticateZendeskMessaging( allowChat, 'messenger' );

	const { isMessagingScriptLoaded } = useLoadZendeskMessaging( allowChat, allowChat );
	const {
		setIsChatLoaded,
		setZendeskClientId,
		setZendeskConnectionStatus,
		setSupportTypingStatus,
	} = useDispatch( HELP_CENTER_STORE );
	const getUnreadNotifications = useGetUnreadConversations();

	const getUnreadListener = useCallback(
		( message: ZendeskMessage, data: { conversation: { id: string } } ) => {
			if ( areSoundNotificationsEnabled ) {
				playNotificationSound();
			}

			if ( isHelpCenterShown ) {
				return;
			}

			Smooch.getConversationById( data?.conversation?.id ).then( () => getUnreadNotifications() );
		},
		[ isHelpCenterShown, areSoundNotificationsEnabled, getUnreadNotifications ]
	);

	const disconnectedListener = useCallback( () => {
		setZendeskConnectionStatus( 'disconnected' );
		recordTracksEvent( 'calypso_smooch_messenger_disconnected' );
	}, [ setZendeskConnectionStatus ] );

	const reconnectingListener = useCallback( () => {
		setZendeskConnectionStatus( 'reconnecting' );
		recordTracksEvent( 'calypso_smooch_messenger_reconnecting' );
	}, [ setZendeskConnectionStatus ] );

	const typingStartListener = useCallback(
		( { conversation }: ConversationData ) => {
			setSupportTypingStatus( conversation.id, true );
		},
		[ setSupportTypingStatus ]
	);
	const typingStopListener = useCallback(
		( { conversation }: ConversationData ) => {
			setSupportTypingStatus( conversation.id, false );
		},
		[ setSupportTypingStatus ]
	);

	const connectedListener = useCallback( () => {
		// We only want to revert the connection status to connected if it was disconnected before.
		// We don't want a "connected" status on page load, it's only useful as a sign of a recovered connection.
		if ( connectionStatus ) {
			setZendeskConnectionStatus( 'connected' );
			recordTracksEvent( 'calypso_smooch_messenger_connected' );
		}
	}, [ setZendeskConnectionStatus, connectionStatus ] );

	const clientIdListener = useCallback(
		( message: ZendeskMessage ) => {
			if ( message?.source?.type === 'web' && message.source?.id ) {
				setZendeskClientId( message.source?.id );
				// Unregister the listener after setting the client ID
				// @ts-expect-error -- 'off' is not part of the def.
				Smooch?.off?.( 'message:sent', clientIdListener );
			}
		},
		[ setZendeskClientId ]
	);

	// Initialize Smooch which communicates with Zendesk
	useEffect( () => {
		if (
			! isMessagingScriptLoaded ||
			! authData?.isLoggedIn ||
			! authData?.jwt ||
			! authData?.externalId
		) {
			return;
		}

		let retryTimeout: ReturnType< typeof setTimeout > | undefined;

		const initializeSmooch = async () => {
			initSmooch( authData, queryClient )
				.then( () => {
					setIsChatLoaded( true );
					recordTracksEvent( 'calypso_smooch_messenger_init', {
						success: true,
						error: '',
					} );

					if ( smoochRef.current ) {
						Smooch.render( smoochRef.current );
					}
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

		initializeSmooch();

		return () => {
			clearTimeout( retryTimeout );
			destroy();
		};
	}, [ isMessagingScriptLoaded, authData, setIsChatLoaded, queryClient ] );

	useEffect( () => {
		if ( isChatLoaded && getZendeskConversations ) {
			const allConversations = getZendeskConversations();
			getUnreadNotifications( allConversations );
			setZendeskClientId( getClientId( allConversations ) );
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
		setZendeskConnectionStatus,
		clientIdListener,
		isChatLoaded,
		typingStartListener,
		typingStopListener,
		getUnreadNotifications,
		setZendeskClientId,
		disconnectedListener,
		reconnectingListener,
		connectedListener,
	] );

	return <div ref={ smoochRef } style={ { display: 'none' } }></div>;
};

export default HelpCenterSmooch;
