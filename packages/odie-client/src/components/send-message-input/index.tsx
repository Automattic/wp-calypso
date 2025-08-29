import { ChatFooter } from '@automattic/agenttic-ui';
import '@automattic/agenttic-ui/index.css';
import { HelpCenterSelect } from '@automattic/data-stores';
import { EmailFallbackNotice } from '@automattic/help-center/src/components/notices';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import { useSelect } from '@wordpress/data';
import { useCallback, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useOdieAssistantContext } from '../../context';
import { useSendChatMessage } from '../../hooks';
import { Message } from '../../types';
import { Notices } from '../notices';
import useMessageSizeErrorNotice from '../notices/use-message-size-error-notice';
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
	const sendMessage = useSendChatMessage();
	const isChatBusy = chat.status === 'loading' || chat.status === 'sending';
	const isInitialLoading = chat.status === 'loading';
	const isLiveChat = chat.provider?.startsWith( 'zendesk' );
	const [ inputValue, setInputValue ] = useState( '' );
	const { isMessageLengthValid, setMessageLengthErrorNotice, clearMessageLengthErrorNotice } =
		useMessageSizeErrorNotice();

	const { connectionStatus } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			connectionStatus: helpCenterSelect.getZendeskConnectionStatus(),
		};
	}, [] );

	const {
		handleImagePaste,
		attachmentAction,
		isAttachingFile,
		showAttachmentButton,
		AttachmentDropZone,
	} = useAttachmentHandler();

	const textAreaPlaceholder = getTextAreaPlaceholder( isChatBusy, cantTransferToZendesk );

	const customActions = showAttachmentButton ? [ attachmentAction ] : undefined;

	const sendMessageHandler = useCallback( async () => {
		const message = inputValue.trim();
		if ( message === '' || isChatBusy ) {
			return;
		}

		if ( ! isMessageLengthValid( message ) ) {
			setMessageLengthErrorNotice();
			return;
		}

		// Immediately clear the input field
		if ( chat?.provider === 'odie' ) {
			setInputValue( '' );
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
			await sendMessage( messageObj );
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
		isMessageLengthValid,
		setMessageLengthErrorNotice,
		trackEvent,
	] );

	const isEmailFallback = chat?.provider === 'zendesk' && forceEmailSupport;

	const handleInputChange = useCallback(
		( value: string ) => {
			setInputValue( value );
			if ( isMessageLengthValid( value ) ) {
				clearMessageLengthErrorNotice();
			}
		},
		[ isMessageLengthValid, clearMessageLengthErrorNotice ]
	);

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

	return (
		<>
			<div className="odie-chat-message-input-container agenttic" ref={ divContainerRef }>
				<Notices />
				{ isEmailFallback ? (
					<EmailFallbackNotice />
				) : (
					<ChatFooter
						inputValue={ inputValue }
						onInputChange={ handleInputChange }
						onSubmit={ sendMessageHandler }
						onKeyDown={ handleKeyDown }
						textareaRef={ textareaRef }
						placeholder={ textAreaPlaceholder }
						isProcessing={
							isChatBusy ||
							isAttachingFile ||
							cantTransferToZendesk ||
							( isLiveChat && connectionStatus !== 'connected' )
						}
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
