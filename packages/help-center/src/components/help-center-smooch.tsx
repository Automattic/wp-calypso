import { recordTracksEvent } from '@automattic/calypso-analytics';
import config from '@automattic/calypso-config';
import { HelpCenterSelect } from '@automattic/data-stores';
import {
	useLoadZendeskMessaging,
	useAuthenticateZendeskMessaging,
} from '@automattic/zendesk-client';
import {
	SMOOCH_INTEGRATION_ID,
	SMOOCH_INTEGRATION_ID_STAGING,
} from '@automattic/zendesk-client/src/constants';
import { useSelect, useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import Smooch from 'smooch';
import { useChatStatus } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { calculateUnread, getClientId, getZendeskConversations } from './utils';

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

const HelpCenterSmooch: React.FC = () => {
	const { data: authData } = useAuthenticateZendeskMessaging( true, 'messenger' );
	const smoochRef = useRef< HTMLDivElement >( null );
	const { isHelpCenterShown, isChatLoaded } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			isHelpCenterShown: helpCenterSelect.isHelpCenterShown(),
			isChatLoaded: helpCenterSelect.getIsChatLoaded(),
		};
	}, [] );

	const { isEligibleForChat } = useChatStatus();
	const { isMessagingScriptLoaded } = useLoadZendeskMessaging(
		'zendesk_support_chat_key',
		isHelpCenterShown && isEligibleForChat,
		isEligibleForChat
	);
	const { setIsChatLoaded, setUnreadCount, setZendeskClientId } =
		useDataStoreDispatch( HELP_CENTER_STORE );

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
			const { unreadConversations } = calculateUnread( allConversations );
			setUnreadCount( unreadConversations );
			setZendeskClientId( getClientId( allConversations ) );
		}
	}, [ isChatLoaded, setUnreadCount, setZendeskClientId ] );

	return <div ref={ smoochRef } style={ { display: 'none' } }></div>;
};

export default HelpCenterSmooch;
