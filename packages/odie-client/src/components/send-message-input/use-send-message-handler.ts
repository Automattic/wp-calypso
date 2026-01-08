import { useCallback } from '@wordpress/element';
import Smooch from 'smooch';
import { Message, Chat } from '../../types';
import { MAX_MESSAGE_LENGTH } from '../notices/use-message-size-error-notice';

interface UseSendMessageHandlerProps {
	inputValue: string;
	setInputValue: ( value: string ) => void;
	hasAttachments: boolean;
	isChatBusy: boolean;
	chat: Chat;
	sendAttachments: () => void;
	textareaRef: React.RefObject< HTMLTextAreaElement >;
	trackEvent: ( event: string, props?: Record< string, unknown > ) => void;
	sendMessage: ( message: Message ) => Promise< unknown >;
}

export function useSendMessageHandler( {
	inputValue,
	setInputValue,
	hasAttachments,
	isChatBusy,
	chat,
	sendAttachments,
	textareaRef,
	trackEvent,
	sendMessage,
}: UseSendMessageHandlerProps ) {
	return useCallback( async () => {
		const message = inputValue.trim().substring( 0, MAX_MESSAGE_LENGTH );

		// Allow submission if there's either a message or attachments
		if ( ( message === '' && ! hasAttachments ) || isChatBusy ) {
			return;
		}

		// Immediately clear the input field
		if ( chat?.provider === 'odie' ) {
			setInputValue( '' );
		} else if ( chat.conversationId ) {
			Smooch?.stopTyping?.();
			sendAttachments();
		}

		if ( ! message ) {
			textareaRef.current?.focus();
			return;
		}

		try {
			trackEvent( 'chat_message_action_send', {
				message_length: inputValue.length,
				provider: chat?.provider,
			} );

			const messageObj = {
				content: inputValue,
				role: 'user',
				type: 'message',
			} as Message;

			if ( chat?.provider === 'zendesk' ) {
				messageObj.metadata = {
					temporary_id: crypto.randomUUID(),
					local_timestamp: Date.now() / 1000,
				};
			}

			sendMessage( messageObj ).catch( ( error ) => {
				if ( error?.type === 'abort' ) {
					setInputValue( inputValue );
				}
			} );

			// Clear input after zendesk messages are sent
			if ( chat?.provider === 'zendesk' ) {
				setInputValue( '' );
			}

			trackEvent( 'chat_message_action_receive', {
				message_length: inputValue.length,
				provider: chat?.provider,
			} );
		} catch ( e ) {
			const error = e as Error;
			trackEvent( 'chat_message_error', {
				error: error?.message,
			} );
		} finally {
			textareaRef.current?.focus();
		}
	}, [
		inputValue,
		isChatBusy,
		chat?.provider,
		sendMessage,
		trackEvent,
		chat.conversationId,
		sendAttachments,
		hasAttachments,
		setInputValue,
		textareaRef,
	] );
}
