import { HelpCenterSelect } from '@automattic/data-stores';
import { zendeskMessageConverter } from '@automattic/zendesk-client';
import { useSelect } from '@wordpress/data';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import Smooch from 'smooch';
import { HELP_CENTER_STORE } from '../constants';
import { useOdieAssistantContext } from '../context';
import { isHappinessEngineerMessage } from '../utils/csat';
import { deduplicateZDMessages } from './use-get-combined-chat';
import type { ZendeskMessage } from '@automattic/zendesk-client';

/**
 * Listens for messages from Zendesk and converts them to Odie messages.
 */
export const useZendeskMessageListener = () => {
	const { setChat, chat, trackEvent } = useOdieAssistantContext();
	// The messages so far, without subscribing to Smooch again for every new one.
	const messagesRef = useRef( chat.messages );
	messagesRef.current = chat.messages;
	// Two agent messages can arrive before the chat re-renders with the first.
	const reportedAgentJoinedRef = useRef< string | null >( null );

	const { isChatLoaded } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			isChatLoaded: helpCenterSelect.getIsChatLoaded(),
		};
	}, [] );

	const messageListener = useCallback(
		( message: unknown, data: { conversation: { id: string } } ) => {
			const zendeskMessage = message as ZendeskMessage;

			if ( data.conversation.id === chat.conversationId ) {
				// Skip form messages with fields (like CSAT forms)
				if ( zendeskMessage.type === 'form' && 'fields' in zendeskMessage ) {
					// We don't want to mark the conversation as read if it's a form message with fields.
					Smooch.markAllAsRead( data.conversation.id );
					return;
				}

				// Only a Happiness Engineer's first message: triggers and the move to email come earlier.
				// A message that arrives while the panel is closed shows up with the history instead.
				if (
					isHappinessEngineerMessage( zendeskMessage ) &&
					reportedAgentJoinedRef.current !== data.conversation.id &&
					! messagesRef.current.some( isHappinessEngineerMessage )
				) {
					reportedAgentJoinedRef.current = data.conversation.id;
					trackEvent( 'chat_agent_joined', { conversation_id: data.conversation.id } );
				}

				const convertedMessage = zendeskMessageConverter( zendeskMessage );
				setChat( ( prevChat ) => ( {
					...prevChat,
					// During connection recovery, some duplication due to auto-redownload and the message listener firing.
					messages: deduplicateZDMessages( [ ...prevChat.messages, convertedMessage ] ),
					status: 'loaded',
				} ) );
				Smooch.markAllAsRead( data.conversation.id );
			}
		},
		[ chat.conversationId, setChat, trackEvent ]
	);

	useEffect( () => {
		if ( ! isChatLoaded ) {
			return;
		}

		Smooch.on( 'message:received', messageListener );

		return () => {
			Smooch?.off?.( 'message:received', messageListener );
		};
	}, [ isChatLoaded, messageListener ] );
};
