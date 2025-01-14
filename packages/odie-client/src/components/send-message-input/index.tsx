import { Spinner } from '@wordpress/components';
import { useCallback, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { SendMessageIcon } from '../../assets/send-message-icon';
import { useOdieAssistantContext } from '../../context';
import { useSendChatMessage } from '../../hooks';
import { Message } from '../../types';
import { AttachmentButton } from './attachment-button';
import { ResizableTextarea } from './resizable-textarea';

import './style.scss';

export const OdieSendMessageButton = () => {
	const divContainerRef = useRef< HTMLDivElement >( null );
	const inputRef = useRef< HTMLTextAreaElement >( null );
	const attachmentButtonRef = useRef< HTMLElement >( null );
	const { trackEvent, chat } = useOdieAssistantContext();
	const sendMessage = useSendChatMessage();
	const isChatBusy = chat.status === 'loading' || chat.status === 'sending';
	const [ isMessageSizeValid, setIsMessageSizeValid ] = useState( true );
	const [ submitDisabled, setSubmitDisabled ] = useState( true );

	const onKeyUp = useCallback( () => {
		// Only triggered when the message is empty
		// used to remove validation message.
		setIsMessageSizeValid( true );
	}, [] );

	const sendMessageHandler = useCallback( async () => {
		const message = inputRef.current?.value.trim();
		const messageLength = message?.length || 0;
		const isMessageLengthValid = messageLength <= 4096; // zendesk api validation

		setIsMessageSizeValid( isMessageLengthValid );

		if ( message === '' || isChatBusy || ! isMessageLengthValid ) {
			return;
		}
		const messageString = inputRef.current?.value;
		// Immediately remove the message from the input field
		if ( chat?.provider === 'odie' ) {
			inputRef.current!.value = '';
		}

		try {
			trackEvent( 'chat_message_action_send' );

			const message = {
				content: messageString,
				role: 'user',
				type: 'message',
			} as Message;

			setSubmitDisabled( true );

			await sendMessage( message );
			// Removes the message from the input field after it has been sent
			if ( chat?.provider === 'zendesk' ) {
				inputRef.current!.value = '';
			}

			trackEvent( 'chat_message_action_receive' );
		} catch ( e ) {
			const error = e as Error;
			trackEvent( 'chat_message_error', {
				error: error?.message,
			} );
		} finally {
			setSubmitDisabled( false );
			inputRef.current?.focus();
		}
	}, [ isChatBusy, chat?.provider, trackEvent, sendMessage ] );

	const inputContainerClasses = clsx(
		'odie-chat-message-input-container',
		attachmentButtonRef?.current && 'odie-chat-message-input-container__attachment-button-visible'
	);

	const buttonClasses = clsx(
		'odie-send-message-inner-button',
		'odie-send-message-inner-button__flag'
	);

	return (
		<>
			{ ! isMessageSizeValid && (
				<div className="odie-chatbox-invalid__message">
					{ __( 'Message exceeds 4096 characters limit.' ) }
				</div>
			) }
			<div className={ inputContainerClasses } ref={ divContainerRef }>
				<form
					onSubmit={ ( event ) => {
						event.preventDefault();
						sendMessageHandler();
					} }
					className="odie-send-message-input-container"
				>
					<ResizableTextarea
						shouldDisableInputField={ isChatBusy }
						sendMessageHandler={ sendMessageHandler }
						className="odie-send-message-input"
						inputRef={ inputRef }
						setSubmitDisabled={ setSubmitDisabled }
						keyUpHandle={ onKeyUp }
					/>
					{ isChatBusy && <Spinner className="odie-send-message-input-spinner" /> }
					<AttachmentButton attachmentButtonRef={ attachmentButtonRef } />
					<button type="submit" className={ buttonClasses } disabled={ submitDisabled }>
						<SendMessageIcon />
					</button>
				</form>
			</div>
		</>
	);
};
