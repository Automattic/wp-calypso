import '@automattic/agenttic-ui/index.css';
import { HelpCenterSelect } from '@automattic/data-stores';
import { EmailFallbackNotice } from '@automattic/help-center/src/components/notices';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
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
	const { sendMessage, abort } = useSendChatMessage();
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

	const { connectionStatus } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			connectionStatus: helpCenterSelect.getZendeskConnectionStatus(),
		};
	}, [] );

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
		if ( message === '' || isChatBusy ) {
			return;
		}

		// Immediately clear the input field
		if ( chat?.provider === 'odie' ) {
			setInputValue( '' );
		} else if ( chat.conversationId ) {
			Smooch.stopTyping();
			sendAttachments();
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
				// Odie messages are considered sent immediately.
				// Because it's impossible to know if the message was sent or until the response is received.
				// Which takes north of 10 seconds.
				isSending: chat?.provider !== 'odie',
				metadata: { temporary_id: crypto.randomUUID() },
			} as Message;

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

	const isDisabled = !! messageSizeNotice || ( isLiveChat && connectionStatus !== 'connected' );
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
						onStop={ abort }
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
