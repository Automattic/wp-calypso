import { Spinner } from '@wordpress/components';
import { useCallback, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import ArrowUp from '../../assets/arrow-up.svg';
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
	const { trackEvent, chat, shouldUseHelpCenterExperience } = useOdieAssistantContext();
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

		if (
			message === '' ||
			isChatBusy ||
			( shouldUseHelpCenterExperience && ! isMessageLengthValid )
		) {
			return;
		}
		const messageString = inputRef.current?.value;
		inputRef.current!.value = '';

		try {
			trackEvent( 'chat_message_action_send' );

			const message = {
				content: messageString,
				role: 'user',
				type: 'message',
			} as Message;

			setSubmitDisabled( true );

			await sendMessage( message );

			trackEvent( 'chat_message_action_receive' );
		} catch ( e ) {
			const error = e as Error;
			trackEvent( 'chat_message_error', {
				error: error?.message,
			} );
		} finally {
			setSubmitDisabled( false );
		}
	}, [ sendMessage, isChatBusy, shouldUseHelpCenterExperience, trackEvent ] );

	const classes = clsx(
		'odie-send-message-inner-button',
		shouldUseHelpCenterExperience && 'odie-send-message-inner-button__flag'
	);
	return (
		<>
			{ ! isMessageSizeValid && shouldUseHelpCenterExperience && (
				<div className="odie-chatbox-invalid__message">
					{ __( 'Message exceeds 4096 characters limit.' ) }
				</div>
			) }
			<div className="odie-chat-message-input-container" ref={ divContainerRef }>
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
					{ shouldUseHelpCenterExperience && <AttachmentButton /> }
					<button type="submit" className={ classes } disabled={ submitDisabled }>
						{ shouldUseHelpCenterExperience ? (
							<SendMessageIcon />
						) : (
							<img src={ ArrowUp } alt={ __( 'Arrow icon', __i18n_text_domain__ ) } />
						) }
					</button>
				</form>
			</div>
		</>
	);
};
