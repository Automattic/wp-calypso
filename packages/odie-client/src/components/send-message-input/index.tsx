import { HelpCenterSelect } from '@automattic/data-stores';
import { EmailFallbackNotice } from '@automattic/help-center/src/components/notices';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import {
	useAttachFileToConversation,
	useAuthenticateZendeskMessaging,
} from '@automattic/zendesk-client';
import { DropZone, Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback, useRef, useState, useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import clsx from 'clsx';
import { SendMessageIcon } from '../../assets/send-message-icon';
import { getOdieWrongFileTypeMessage } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { useSendChatMessage } from '../../hooks';
import { Message } from '../../types';
import { zendeskMessageConverter } from '../../utils';
import { Notices } from '../notices';
import useMessageSizeErrorNotice from '../notices/use-message-size-error-notice';
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
	const {
		trackEvent,
		chat,
		addMessage,
		isUserEligibleForPaidSupport,
		canConnectToZendesk,
		forceEmailSupport,
	} = useOdieAssistantContext();
	const cantTransferToZendesk =
		( chat.messages?.[ chat.messages.length - 1 ]?.context?.flags?.forward_to_human_support &&
			! canConnectToZendesk ) ??
		false;
	const sendMessage = useSendChatMessage();
	const isChatBusy = chat.status === 'loading' || chat.status === 'sending';
	const isInitialLoading = chat.status === 'loading';
	const isLiveChat = chat.provider?.startsWith( 'zendesk' );
	const [ submitDisabled, setSubmitDisabled ] = useState( true );

	// Focus input when chat is ready
	useEffect( () => {
		if ( ! isInitialLoading ) {
			inputRef.current?.focus();
		}
	}, [ isInitialLoading ] );

	const { isMessageLengthValid, setMessageLengthErrorNotice, clearMessageLengthErrorNotice } =
		useMessageSizeErrorNotice();

	const { data: authData } = useAuthenticateZendeskMessaging(
		isUserEligibleForPaidSupport,
		'messenger'
	);
	const { zendeskClientId, connectionStatus } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		const connectionStatus = helpCenterSelect.getZendeskConnectionStatus();
		return {
			zendeskClientId: helpCenterSelect.getZendeskClientId(),
			connectionStatus,
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
				addMessage( getOdieWrongFileTypeMessage() );
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

	const sendMessageHandler = useCallback( async () => {
		const message = inputRef.current?.value.trim();
		if ( message === '' || isChatBusy ) {
			return;
		}

		if ( ! isMessageLengthValid( message ) ) {
			setMessageLengthErrorNotice();
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
	}, [
		isChatBusy,
		chat?.provider,
		trackEvent,
		sendMessage,
		isMessageLengthValid,
		setMessageLengthErrorNotice,
	] );

	const inputContainerClasses = clsx(
		'odie-chat-message-input-container',
		attachmentButtonRef?.current && 'odie-chat-message-input-container__attachment-button-visible'
	);

	const buttonClasses = clsx(
		'odie-send-message-inner-button',
		'odie-send-message-inner-button__flag'
	);

	const showAttachmentButton = chat.conversationId && inferredClientId;
	const isEmailFallback = chat?.provider === 'zendesk' && forceEmailSupport;

	const handleOnKeyUp = useCallback( () => {
		const message = inputRef.current?.value.trim();
		if ( isMessageLengthValid( message ) ) {
			clearMessageLengthErrorNotice();
		}
	}, [ clearMessageLengthErrorNotice, isMessageLengthValid ] );

	return (
		<>
			<div className={ inputContainerClasses } ref={ divContainerRef }>
				<Notices />
				<div className="odie-send-message-container">
					{ isEmailFallback ? (
						<EmailFallbackNotice />
					) : (
						<form
							onSubmit={ ( event ) => {
								event.preventDefault();
								sendMessageHandler();
							} }
							className="odie-send-message-input-container"
						>
							<div className="odie-send-message-input-and-spinner">
								<ResizableTextarea
									shouldDisableInputField={
										isChatBusy ||
										isAttachingFile ||
										cantTransferToZendesk ||
										isEmailFallback ||
										( isLiveChat && connectionStatus !== 'connected' )
									}
									sendMessageHandler={ sendMessageHandler }
									className="odie-send-message-input"
									inputRef={ inputRef }
									setSubmitDisabled={ setSubmitDisabled }
									keyUpHandle={ handleOnKeyUp }
									onPasteHandle={ onPaste }
									placeholder={ textAreaPlaceholder }
								/>
								{ isChatBusy && <Spinner className="odie-send-message-input-spinner" /> }
							</div>
							{ showAttachmentButton && (
								<AttachmentButton
									attachmentButtonRef={ attachmentButtonRef }
									onFileUpload={ handleFileUpload }
									isAttachingFile={ isAttachingFile }
									isDisabled={
										isEmailFallback || ( isLiveChat && connectionStatus !== 'connected' )
									}
								/>
							) }
							<button
								type="submit"
								className={ buttonClasses }
								disabled={ submitDisabled || ( isLiveChat && connectionStatus !== 'connected' ) }
								aria-label={ __( 'Send message', __i18n_text_domain__ ) }
							>
								<SendMessageIcon />
							</button>
						</form>
					) }
				</div>
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
