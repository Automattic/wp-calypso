import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import {
	useAttachFileToConversation,
	useAuthenticateZendeskMessaging,
} from '@automattic/zendesk-client';
import { DropZone, Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { SendMessageIcon } from '../../assets/send-message-icon';
import { ODIE_WRONG_FILE_TYPE_MESSAGE } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { useSendChatMessage } from '../../hooks';
import { Message } from '../../types';
import { zendeskMessageConverter } from '../../utils';
import { AttachmentButton } from './attachment-button';
import { ResizableTextarea } from './resizable-textarea';

import './style.scss';

const getFileType = ( file: File ) => {
	if ( file.type.startsWith( 'image/' ) ) {
		return 'image-placeholder';
	}

	return 'text';
};

const getPlaceholderAttachmentMessage = ( file: File ) => {
	return zendeskMessageConverter( {
		role: 'user',
		type: getFileType( file ),
		displayName: '',
		text: '',
		id: String( new Date().getTime() ),
		received: new Date().getTime(),
		source: { type: 'web', id: '', integrationId: '' },
		mediaUrl: URL.createObjectURL( file ),
	} );
};

const getTextAreaPlaceholder = (
	shouldDisableInputField: boolean,
	cantTransferToZendesk: boolean
) => {
	if ( cantTransferToZendesk ) {
		return __( 'Oops, something went wrong', __i18n_text_domain__ );
	}
	return shouldDisableInputField
		? __( 'Just a moment…', __i18n_text_domain__ )
		: __( 'Type a message…', __i18n_text_domain__ );
};

export const OdieSendMessageButton = () => {
	const divContainerRef = useRef< HTMLDivElement >( null );
	const inputRef = useRef< HTMLTextAreaElement >( null );
	const attachmentButtonRef = useRef< HTMLElement >( null );
	const { trackEvent, chat, addMessage, isUserEligibleForPaidSupport, canConnectToZendesk } =
		useOdieAssistantContext();
	const cantTransferToZendesk =
		( chat.messages?.[ chat.messages.length - 1 ]?.context?.flags?.forward_to_human_support &&
			! canConnectToZendesk ) ??
		false;
	const sendMessage = useSendChatMessage();
	const isChatBusy = chat.status === 'loading' || chat.status === 'sending';
	const [ isMessageSizeValid, setIsMessageSizeValid ] = useState( true );
	const [ submitDisabled, setSubmitDisabled ] = useState( true );

	const { data: authData } = useAuthenticateZendeskMessaging(
		isUserEligibleForPaidSupport,
		'messenger'
	);
	const { zendeskClientId } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			zendeskClientId: helpCenterSelect.getZendeskClientId(),
		};
	}, [] );
	const inferredClientId = chat.clientId ? chat.clientId : zendeskClientId;

	const { isPending: isAttachingFile, mutateAsync: attachFileToConversation } =
		useAttachFileToConversation();

	const textAreaPlaceholder = getTextAreaPlaceholder( isChatBusy, cantTransferToZendesk );

	const handleFileUpload = useCallback(
		async ( file: File ) => {
			if ( file.type.startsWith( 'image/' ) ) {
				if ( authData && chat.conversationId && inferredClientId && file ) {
					attachFileToConversation( {
						authData,
						file,
						conversationId: chat.conversationId,
						clientId: inferredClientId,
					} ).then( () => {
						addMessage( getPlaceholderAttachmentMessage( file ) );
						trackEvent( 'send_message_attachment', { type: file.type } );
					} );
				}
			} else {
				addMessage( ODIE_WRONG_FILE_TYPE_MESSAGE );
			}
		},
		[
			authData,
			chat.conversationId,
			inferredClientId,
			attachFileToConversation,
			addMessage,
			trackEvent,
		]
	);

	const onFilesDrop = ( files: File[] ) => {
		const file = files?.[ 0 ];
		if ( file ) {
			handleFileUpload( file );
		}
	};

	const onPaste = ( event: React.ClipboardEvent ) => {
		const items = event.clipboardData.items;
		const file = items?.[ 0 ]?.getAsFile();
		if ( file ) {
			event.preventDefault();
			handleFileUpload( file );
		}
	};

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
			trackEvent( 'chat_message_action_send', {
				message_length: messageString?.length,
				provider: chat?.provider,
			} );

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

			trackEvent( 'chat_message_action_receive', {
				message_length: messageString?.length,
				provider: chat?.provider,
			} );
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

	const showAttachmentButton = chat.conversationId && inferredClientId;

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
						shouldDisableInputField={ isChatBusy || isAttachingFile || cantTransferToZendesk }
						sendMessageHandler={ sendMessageHandler }
						className="odie-send-message-input"
						inputRef={ inputRef }
						setSubmitDisabled={ setSubmitDisabled }
						keyUpHandle={ onKeyUp }
						onPasteHandle={ onPaste }
						placeholder={ textAreaPlaceholder }
					/>
					{ isChatBusy && <Spinner className="odie-send-message-input-spinner" /> }
					{ showAttachmentButton && (
						<AttachmentButton
							attachmentButtonRef={ attachmentButtonRef }
							onFileUpload={ handleFileUpload }
							isAttachingFile={ isAttachingFile }
						/>
					) }
					<button type="submit" className={ buttonClasses } disabled={ submitDisabled }>
						<SendMessageIcon />
					</button>
				</form>
			</div>
			{ showAttachmentButton && (
				<DropZone
					onFilesDrop={ onFilesDrop }
					label={ __( 'Share this image with our Happiness Engineers', __i18n_text_domain__ ) }
				/>
			) }
		</>
	);
};
