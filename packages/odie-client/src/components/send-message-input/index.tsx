import { Spinner } from '@wordpress/components';
import { useCallback, useRef, RefObject } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import ArrowUp from '../../assets/arrow-up.svg';
import { useOdieAssistantContext } from '../../context';
import { useSendChatMessage } from '../../query/use-send-chat-message';
import { Message } from '../../types/';
import { JumpToRecent } from '../message/jump-to-recent';
import { ResizableTextarea } from './resizable-textarea';

import './style.scss';

export const OdieSendMessageButton = ( {
	containerReference,
}: {
	containerReference: RefObject< HTMLDivElement >;
} ) => {
	const divContainerRef = useRef< HTMLDivElement >( null );
	const inputRef = useRef< HTMLTextAreaElement >( null );
	const { trackEvent, chatStatus } = useOdieAssistantContext();
	const sendMessage = useSendChatMessage();
	const shouldBeDisabled = chatStatus === 'loading' || chatStatus === 'sending';

	const sendMessageHandler = useCallback( async () => {
		if ( inputRef.current?.value.trim() === '' || shouldBeDisabled ) {
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

			await sendMessage( message );

			trackEvent( 'chat_message_action_receive' );
		} catch ( e ) {
			const error = e as Error;
			trackEvent( 'chat_message_error', {
				error: error?.message,
			} );
		}
	}, [ sendMessage, trackEvent ] );

	return (
		<>
			<JumpToRecent containerReference={ containerReference } />
			<div className="odie-chat-message-input-container" ref={ divContainerRef }>
				<form
					onSubmit={ ( event ) => {
						event.preventDefault();
						sendMessageHandler();
					} }
					className="odie-send-message-input-container"
				>
					<ResizableTextarea
						sendMessageHandler={ sendMessageHandler }
						className="odie-send-message-input"
						inputRef={ inputRef }
					/>
					{ shouldBeDisabled && <Spinner className="odie-send-message-input-spinner" /> }
					<button
						type="submit"
						className="odie-send-message-inner-button"
						disabled={ shouldBeDisabled }
					>
						<img src={ ArrowUp } alt={ __( 'Arrow icon', __i18n_text_domain__ ) } />
					</button>
				</form>
			</div>
		</>
	);
};
