import '@automattic/agenttic-ui/index.css';
import { EmailFallbackNotice } from '@automattic/help-center/src/components/notices';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../../context';
import { useSendChatMessage } from '../../hooks';
import { Message } from '../../types';
import { AgentUIFooter } from '../chat-footer';
import { useConnectionStatusNotice, useMessageSizeErrorNotice } from '../notices';
import { useAttachmentHandler } from './use-attachment-handler';

const getTextAreaPlaceholder = (
	shouldDisableInputField: boolean,
	cantTransferToZendesk: boolean
) => {
	if ( cantTransferToZendesk ) {
		return __( 'Oops, something went wrong', __i18n_text_domain__ );
	}
	return shouldDisableInputField
		? __( 'Just a moment…', __i18n_text_domain__ )
		: __( 'Ask anything…', __i18n_text_domain__ );
};

export const OdieSendMessageButton = () => {
	const divContainerRef = useRef< HTMLDivElement >( null );
	const textareaRef = useRef< HTMLTextAreaElement >( null );
	const { trackEvent, chat, canConnectToZendesk, forceEmailSupport } = useOdieAssistantContext();
	const cantTransferToZendesk =
		( chat.messages?.[ chat.messages.length - 1 ]?.context?.flags?.forward_to_human_support &&
			! canConnectToZendesk ) ??
		false;
	const { sendMessage } = useSendChatMessage();
	const isChatBusy = chat.status === 'loading' || chat.status === 'sending';
	const isInitialLoading = chat.status === 'loading';
	const isLiveChat = chat.provider?.startsWith( 'zendesk' );
	const [ inputValue, setInputValue ] = useState( '' );
	const messageSizeNotice = useMessageSizeErrorNotice( inputValue.trim().length );
	const connectionNotice = useConnectionStatusNotice( isLiveChat );

	// Focus the textarea when the component mounts
	useEffect( () => {
		textareaRef.current?.focus();
	}, [ textareaRef ] );

	useEffect( () => {
		if ( isLiveChat ) {
			if ( inputValue.length > 0 ) {
				Smooch.startTyping();
			} else {
				Smooch.stopTyping();
			}
		}
	}, [ inputValue, isLiveChat ] );

	const {
		attachmentPreviews,
		sendAttachments,
		handleImagePaste,
		attachmentAction,
		isAttachingFile,
		showAttachmentButton,
		AttachmentDropZone,
		badFormatNotice,
	} = useAttachmentHandler();

	const hasAttachments = !! attachmentPreviews;

	// Prioritize connection status notice over message size notice
	const notice = connectionNotice || messageSizeNotice || badFormatNotice;

	useEffect( () => {
		function handleBlur() {
			Smooch.stopTyping();
		}
		if ( isLiveChat ) {
			const textarea = textareaRef.current;
			if ( textarea ) {
				textarea.addEventListener( 'blur', handleBlur );

				return () => {
					textarea.removeEventListener( 'blur', handleBlur );
				};
			}
		}
	}, [ textareaRef, isLiveChat ] );

	const textAreaPlaceholder = getTextAreaPlaceholder( isChatBusy, cantTransferToZendesk );

	const customActions = showAttachmentButton ? [ attachmentAction ] : undefined;

	const sendMessageHandler = useCallback( async () => {
		const message = inputValue.trim().substring( 0, 4096 );

		// Allow submission if there's either a message or attachments
		if ( ( message === '' && ! hasAttachments ) || isChatBusy ) {
			return;
		}

		// Immediately clear the input field
		if ( chat?.provider === 'odie' ) {
			setInputValue( '' );
		} else if ( chat.conversationId ) {
			Smooch.stopTyping();
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
	] );

	const isEmailFallback = chat?.provider === 'zendesk' && forceEmailSupport;

	// Handle key events including Enter submission and paste
	const handleKeyDown = useCallback(
		( e: React.KeyboardEvent< HTMLTextAreaElement > ) => {
			if ( e.key === 'Enter' && ! e.shiftKey ) {
				e.preventDefault();
				sendMessageHandler();
			}
			handleImagePaste( e );
		},
		[ sendMessageHandler, handleImagePaste ]
	);

	const isInputEmpty = inputValue.trim() === '';

	// Disable if:
	// 1. Message is too long (messageSizeNotice)
	// 2. Input is empty AND no attachments
	const isDisabled = !! messageSizeNotice || ( isInputEmpty && ! hasAttachments );
	// When there is a reason to disable the input, we should not convey a processing state.
	const isProcessing = ( isChatBusy || isAttachingFile || cantTransferToZendesk ) && ! isDisabled;

	return (
		<>
			<div className="odie-chat-message-input-container agenttic" ref={ divContainerRef }>
				{ isEmailFallback ? (
					<EmailFallbackNotice />
				) : (
					<AgentUIFooter
						value={ inputValue }
						onChange={ setInputValue }
						onSubmit={ sendMessageHandler }
						attachmentPreviews={ attachmentPreviews }
						onKeyDown={ handleKeyDown }
						textareaRef={ textareaRef }
						disabled={ isDisabled }
						notice={ notice }
						placeholder={ textAreaPlaceholder }
						isProcessing={ isProcessing }
						focusOnMount={ ! isInitialLoading }
						customActions={ customActions }
						actionOrder="before-submit"
					/>
				) }
			</div>
			<AttachmentDropZone />
		</>
	);
};
