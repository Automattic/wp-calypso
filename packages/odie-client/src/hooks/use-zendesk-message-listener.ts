import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { useCallback, useEffect } from '@wordpress/element';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { zendeskMessageConverter } from '../utils';
import { deduplicateZDMessages } from './use-get-combined-chat';
import type { ZendeskMessage } from '../types';

/**
 * Listens for messages from Zendesk and converts them to Odie messages.
 */
export const useZendeskMessageListener = () => {
	const { setChat, chat } = useOdieAssistantContext();

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
