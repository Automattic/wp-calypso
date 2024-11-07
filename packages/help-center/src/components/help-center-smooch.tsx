import { recordTracksEvent } from '@automattic/calypso-analytics';
import { HelpCenterSelect } from '@automattic/data-stores';
import {
	useSmooch,
	useLoadZendeskMessaging,
	useAuthenticateZendeskMessaging,
} from '@automattic/zendesk-client';
import { useSelect, useDispatch as useDataStoreDispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { useChatStatus } from '../hooks';
import { HELP_CENTER_STORE } from '../stores';
import { calculateUnread, getClientId } from './utils';

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
	const { initSmooch, destroy, getConversations, renderSmooch } = useSmooch();

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
					renderSmooch( smoochRef.current );
				}
			}
		}

		return () => {
			destroy();
		};
	}, [ isMessagingScriptLoaded, authData, initSmooch, setIsChatLoaded, renderSmooch, destroy ] );

	useEffect( () => {
		if ( isChatLoaded && getConversations ) {
			const conversations = getConversations();
			const { unreadConversations } = calculateUnread( conversations );
			setUnreadCount( unreadConversations );
			setZendeskClientId( getClientId( conversations ) );
		}
	}, [ isChatLoaded, getConversations, setUnreadCount, setZendeskClientId ] );

	return <div ref={ smoochRef } style={ { display: 'none' } }></div>;
};

export default HelpCenterSmooch;
