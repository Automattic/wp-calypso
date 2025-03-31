import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterSelect } from '@automattic/data-stores';
import { useGetUnreadConversations } from '@automattic/odie-client/src/data';
import {
	useLoadZendeskMessaging,
	useAuthenticateZendeskMessaging,
	isTestModeEnvironment,
} from '@automattic/zendesk-client';
import {
	SMOOCH_INTEGRATION_ID,
	SMOOCH_INTEGRATION_ID_STAGING,
} from '@automattic/zendesk-client/src/constants';
import { useSelect, useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import Smooch from 'smooch';
import { useChatStatus } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { getClientId, getZendeskConversations } from './utils';
import type { ZendeskMessage } from '@automattic/odie-client';

const destroy = () => {
	Smooch.destroy();
};

const initSmooch = ( {
	jwt,
	externalId,
}: {
	isLoggedIn: boolean;
	jwt: string;
	externalId: string | undefined;
} ) => {
	const isTestMode = isTestModeEnvironment();

	return Smooch.init( {
		integrationId: isTestMode ? SMOOCH_INTEGRATION_ID_STAGING : SMOOCH_INTEGRATION_ID,
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
	const smoochRef = useRef< HTMLDivElement >( null );
	const { isHelpCenterShown, isChatLoaded, areSoundNotificationsEnabled, allowPremiumSupport } =
		useSelect( ( select ) => {
			const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
			return {
				isHelpCenterShown: helpCenterSelect.isHelpCenterShown(),
				isChatLoaded: helpCenterSelect.getIsChatLoaded(),
				areSoundNotificationsEnabled: helpCenterSelect.getAreSoundNotificationsEnabled(),
				allowPremiumSupport: helpCenterSelect.getAllowPremiumSupport(),
			};
		}, [] );

	const allowChat = enableAuth && ( isEligibleForChat || allowPremiumSupport );

	const { data: authData } = useAuthenticateZendeskMessaging( allowChat, 'messenger' );

	const { isMessagingScriptLoaded } = useLoadZendeskMessaging( allowChat, allowChat );
	const { setIsChatLoaded, setZendeskClientId } = useDataStoreDispatch( HELP_CENTER_STORE );
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
		[ isHelpCenterShown, areSoundNotificationsEnabled ]
	);

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
			initSmooch( authData )
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
			if ( smoochRef.current ) {
				Smooch.render( smoochRef.current );
			}
		};

		initializeSmooch();

		return () => {
			clearTimeout( retryTimeout );
			destroy();
		};
	}, [ isMessagingScriptLoaded, authData, setIsChatLoaded ] );

	useEffect( () => {
		if ( isChatLoaded && getZendeskConversations ) {
			const allConversations = getZendeskConversations();
			getUnreadNotifications( allConversations );
			setZendeskClientId( getClientId( allConversations ) );
			Smooch.on( 'message:received', getUnreadListener );
			Smooch.on( 'message:sent', clientIdListener );
		}

		return () => {
			// @ts-expect-error -- 'off' is not part of the def.
			Smooch?.off?.( 'message:received', getUnreadListener );
			// @ts-expect-error -- 'off' is not part of the def.
			Smooch?.off?.( 'message:sent', clientIdListener );
		};
	}, [ getUnreadListener, isChatLoaded, getUnreadNotifications, setZendeskClientId ] );

	return <div ref={ smoochRef } style={ { display: 'none' } }></div>;
};

export default HelpCenterSmooch;
