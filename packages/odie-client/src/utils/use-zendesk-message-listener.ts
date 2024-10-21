import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { useEffect } from '@wordpress/element';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../context';
import { zendeskMessageConverter } from './zendesk-message-converter';
import type { ZendeskMessage } from '../types/';

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

	useEffect( () => {
		if ( ! isChatLoaded || ! chat?.conversationId ) {
			return;
		}

		// Smooch types are not up to date
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		Smooch.on( 'message:received', ( message: any, data ) => {
			const zendeskMessage = message as ZendeskMessage;

			if ( data.conversation.id === chat?.conversationId ) {
				const convertedMessage = zendeskMessageConverter( zendeskMessage );
				setChat( ( prevChat ) => {
					return {
						...prevChat,
						messages: [ ...prevChat.messages, convertedMessage ],
					};
				} );
				Smooch.markAllAsRead( data.conversation.id );
			}
		} );

		return () => {
			// @ts-expect-error -- 'off' is not part of the def.
			Smooch?.off( 'message:received' );
		};
	}, [ isChatLoaded, chat?.conversationId ] );
};
