import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { zendeskMessageConverter } from '../utils';
import type { ZendeskMessage } from '../types';

/**
 * Listens for messages from Zendesk and converts them to Odie messages.
 */
export const useZendeskMessageListener = () => {
	const { setChat, chat } = useOdieAssistantContext();

	const { isChatLoaded, currentSupportInteraction } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			currentSupportInteraction: helpCenterSelect.getCurrentSupportInteraction(),
			isChatLoaded: helpCenterSelect.getIsChatLoaded(),
		};
	}, [] );

	const currentZendeskConversationId = currentSupportInteraction?.events.find(
		( event ) => event.event_source === 'zendesk'
	)?.event_external_id;

	useEffect( () => {
		if ( ! isChatLoaded ) {
			return;
		}

		Smooch.on( 'message:received', ( message, data ) => {
			const zendeskMessage = message as ZendeskMessage;

			if ( data.conversation.id === chat.conversationId ) {
				const convertedMessage = zendeskMessageConverter( zendeskMessage );
				setChat( ( prevChat ) => ( {
					...prevChat,
					messages: [ ...prevChat.messages, convertedMessage ],
					status: 'loaded',
				} ) );
				Smooch.markAllAsRead( data.conversation.id );
			}
		} );

		return () => {
			// @ts-expect-error -- 'off' is not part of the def.
			Smooch?.off( 'message:received' );
		};
	}, [ isChatLoaded, currentZendeskConversationId, chat, setChat, currentSupportInteraction ] );
};
