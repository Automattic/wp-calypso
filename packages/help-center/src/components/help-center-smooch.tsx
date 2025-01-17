import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { HelpCenterSelect } from '@automattic/data-stores';
import { useGetUnreadConversations } from '@automattic/odie-client/src/data';
import {
	useLoadZendeskMessaging,
	useAuthenticateZendeskMessaging,
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
	const currentEnvironment = config( 'env_id' );
	const isTestMode = currentEnvironment !== 'production';

	return Smooch.init( {
		integrationId: isTestMode ? SMOOCH_INTEGRATION_ID_STAGING : SMOOCH_INTEGRATION_ID,
		embedded: true,
		externalId,
		jwt,
	} );
};

const HelpCenterSmooch: React.FC< { enableAuth: boolean } > = ( { enableAuth } ) => {
	const { isEligibleForChat } = useChatStatus();
	const { data: authData } = useAuthenticateZendeskMessaging(
		enableAuth && isEligibleForChat,
		'messenger'
	);
	const smoochRef = useRef< HTMLDivElement >( null );
	const { isHelpCenterShown, isChatLoaded } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			isHelpCenterShown: helpCenterSelect.isHelpCenterShown(),
			isChatLoaded: helpCenterSelect.getIsChatLoaded(),
		};
	}, [] );

	const { isMessagingScriptLoaded } = useLoadZendeskMessaging(
		'zendesk_support_chat_key',
		isEligibleForChat && enableAuth,
		isEligibleForChat && enableAuth
	);
	const { setIsChatLoaded, setZendeskClientId } = useDataStoreDispatch( HELP_CENTER_STORE );
	const getUnreadNotifications = useGetUnreadConversations();

	const getUnreadListener = useCallback(
		( message: ZendeskMessage, data: { conversation: { id: string } } ) => {
			if ( isHelpCenterShown ) {
				return;
			}

			Smooch.getConversationById( data?.conversation?.id ).then( () => getUnreadNotifications() );
		},
		[ isHelpCenterShown ]
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
		if ( isMessagingScriptLoaded && authData?.isLoggedIn ) {
			if ( authData?.jwt && authData?.externalId ) {
				initSmooch( authData )
					.then( () => {
						setIsChatLoaded( true );
						recordTracksEvent( 'calypso_smooch_messenger_init', {
							success: true,
							error: '',
						} );
					} )
					.catch( ( error ) => {
						setIsChatLoaded( true );
						recordTracksEvent( 'calypso_smooch_messenger_init', {
							success: false,
							error: error.message,
						} );
					} );
				if ( smoochRef.current ) {
					Smooch.render( smoochRef.current );
				}
			}
		}

		return () => {
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
