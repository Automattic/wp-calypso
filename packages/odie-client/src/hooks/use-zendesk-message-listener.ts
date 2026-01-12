import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { zendeskMessageConverter } from '@automattic/zendesk-client';
import { useSelect } from '@wordpress/data';
import { useCallback, useEffect, useRef } from '@wordpress/element';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { deduplicateZDMessages } from './use-get-combined-chat';
import type { Message } from '../types';
import type { ZendeskMessage } from '@automattic/zendesk-client';

/**
 * Listens for messages from Zendesk and converts them to Odie messages.
 */
export const useZendeskMessageListener = () => {
	const { setChat, chat, addMessage } = useOdieAssistantContext();
	const hasAddedStartedLabelForConversation = useRef< string | null >( null );

	const { isChatLoaded, typingStatus } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			isChatLoaded: helpCenterSelect.getIsChatLoaded(),
			typingStatus: helpCenterSelect.getSupportTypingStatus( chat.conversationId ?? '' ),
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
		[ chat.conversationId, setChat ]
	);

	useEffect( () => {
		if ( ! typingStatus || ! chat.conversationId ) {
			return;
		}

		if ( hasAddedStartedLabelForConversation.current === chat.conversationId ) {
			return;
		}

		const internalMessageId = `chat-with-support-started-${ chat.conversationId }`;
		const alreadyAdded = chat.messages.some(
			( message ) => message.internal_message_id === internalMessageId
		);
		if ( alreadyAdded ) {
			hasAddedStartedLabelForConversation.current = chat.conversationId;
			return;
		}

		const marker: Message = {
			content: '',
			role: 'bot' as const,
			type: 'meta' as const,
			internal_message_id: internalMessageId,
			context: {
				flags: {
					show_chat_with_support_started_label: true,
					hide_disclaimer_content: true,
					show_ai_avatar: false,
				},
				site_id: null,
			},
		};
		addMessage( marker );
		hasAddedStartedLabelForConversation.current = chat.conversationId;
	}, [ typingStatus, addMessage, chat.conversationId, chat.messages ] );

	useEffect( () => {
		if ( ! isChatLoaded ) {
			return;
		}

		Smooch.on( 'message:received', messageListener );

		return () => {
			// @ts-expect-error -- 'off' is not part of the def.
			Smooch?.off?.( 'message:received', messageListener );
		};
	}, [ isChatLoaded, messageListener ] );
};
