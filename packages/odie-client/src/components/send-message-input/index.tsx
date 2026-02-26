import '@automattic/agenttic-ui/index.css';
import { useInput } from '@automattic/agenttic-ui';
import { EmailFallbackNotice } from '@automattic/help-center/src/components/notices';
import { useCallback, useEffect, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { useSearchParams } from 'react-router-dom';
import Smooch from 'smooch';
import { useOdieAssistantContext } from '../../context';
import { useSendChatMessage } from '../../hooks';
import { AgentUIFooter } from '../chat-footer';
import { useConnectionStatusNotice, useMessageSizeErrorNotice } from '../notices';
import { useAttachmentHandler } from './use-attachment-handler';
import { useSendMessageHandler } from './use-send-message-handler';

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
	const { trackEvent, chat, canConnectToZendesk, forceEmailSupport } = useOdieAssistantContext();
	const cantTransferToZendesk =
		( chat.messages?.[ chat.messages.length - 1 ]?.context?.flags?.forward_to_human_support &&
			! canConnectToZendesk ) ??
		false;
	const { sendMessage } = useSendChatMessage();
	const isChatBusy = chat.status === 'loading' || chat.status === 'sending';
	const isInitialLoading = chat.status === 'loading';
	const isLiveChat = chat.provider?.startsWith( 'zendesk' );
	const [ searchParams ] = useSearchParams();
	const queryFromParam = searchParams.get( 'query' ) || '';
	const chatIdFromParam = searchParams.get( 'chatId' );
	const queryForNewChat = chatIdFromParam ? '' : queryFromParam;
	const [ initialQuery, setInitialQuery ] = useState( queryForNewChat );
	const [ inputValue, setInputValue ] = useState( initialQuery );
	const messageSizeNotice = useMessageSizeErrorNotice( inputValue.trim().length );
	const connectionNotice = useConnectionStatusNotice( isLiveChat );

	useEffect( () => {
		// Only process query param for new conversations (no chatId)
		// This prevents refilling the input when navigating back to an existing chat
		if ( ! chatIdFromParam ) {
			setInitialQuery( queryFromParam );
		}
	}, [ queryFromParam, chatIdFromParam ] );

	// I'm only using adjustHeight from agenttic-ui
	const { textareaRef } = useInput( {
		value: inputValue,
		setValue: () => {},
		onSubmit: () => {},
		isProcessing: false,
	} );

	useEffect( () => {
		if ( isLiveChat ) {
			if ( inputValue.length > 0 ) {
				Smooch?.startTyping?.();
			} else {
				Smooch?.stopTyping?.();
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

	const sendMessageHandler = useSendMessageHandler( {
		inputValue,
		setInputValue,
		hasAttachments,
		isChatBusy,
		chat,
		sendAttachments,
		textareaRef,
		trackEvent,
		sendMessage,
	} );

	// Focus the textarea when the component mounts
	useEffect( () => {
		textareaRef.current?.focus();
	}, [ textareaRef ] );

	// Prioritize connection status notice over message size notice
	const notice = connectionNotice || messageSizeNotice || badFormatNotice;

	useEffect( () => {
		function handleBlur() {
			Smooch?.stopTyping?.();
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

	useEffect( () => {
		if ( initialQuery && ! isProcessing && chat.status !== 'loading' ) {
			setInputValue( initialQuery );
			setInitialQuery( '' );
			if ( chat.messages.length === 0 ) {
				sendMessageHandler();
			}
		}
	}, [
		initialQuery,
		sendMessageHandler,
		isProcessing,
		isDisabled,
		chat.messages.length,
		chat.status,
	] );

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
