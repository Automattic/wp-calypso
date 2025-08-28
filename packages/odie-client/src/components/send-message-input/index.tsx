import { ChatFooter } from '@automattic/agenttic-ui';
import '@automattic/agenttic-ui/index.css';
import { HelpCenterSelect } from '@automattic/data-stores';
import { EmailFallbackNotice } from '@automattic/help-center/src/components/notices';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import {
	useAttachFileToConversation,
	useAuthenticateZendeskMessaging,
} from '@automattic/zendesk-client';
import { DropZone } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback, useRef, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { image } from '@wordpress/icons';
import { getOdieWrongFileTypeMessage } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { useSendChatMessage } from '../../hooks';
import { Message } from '../../types';
import { zendeskMessageConverter } from '../../utils';
import { Notices } from '../notices';
import useMessageSizeErrorNotice from '../notices/use-message-size-error-notice';

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
		: __( 'Ask anything…', __i18n_text_domain__ );
};

export const OdieSendMessageButton = () => {
	const divContainerRef = useRef< HTMLDivElement >( null );
	const textareaRef = useRef< HTMLTextAreaElement >( null );
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
	const [ inputValue, setInputValue ] = useState( '' );
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
		trackEvent,
		sendMessage,
		isMessageLengthValid,
		setMessageLengthErrorNotice,
	] );

	const showAttachmentButton = chat.conversationId && inferredClientId;
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
			// Handle paste events for images
			if ( e.key === 'v' && ( e.ctrlKey || e.metaKey ) ) {
				setTimeout( () => {
					navigator.clipboard
						.read()
						.then( ( items ) => {
							for ( const item of items ) {
								for ( const type of item.types ) {
									if ( type.startsWith( 'image/' ) ) {
										item.getType( type ).then( ( blob ) => {
											const file = new File( [ blob ], 'pasted-image.png', { type } );
											handleFileUpload( file );
										} );
										break;
									}
								}
							}
						} )
						.catch( () => {
							// Clipboard API not supported
						} );
				}, 0 );
			}
		},
		[ sendMessageHandler, handleFileUpload ]
	);

	const customActions = showAttachmentButton
		? [
				{
					id: 'attachment',
					icon: image,
					onClick: () => {
						const input = document.createElement( 'input' );
						input.type = 'file';
						input.accept = 'image/*';
						input.onchange = ( e ) => {
							const file = ( e.target as HTMLInputElement ).files?.[ 0 ];
							if ( file ) {
								handleFileUpload( file );
							}
						};
						input.click();
					},
					variant: 'ghost' as const,
					disabled:
						isAttachingFile ||
						isEmailFallback ||
						( isLiveChat && connectionStatus !== 'connected' ),
					'aria-label': __( 'Attach file', __i18n_text_domain__ ),
				},
		  ]
		: undefined;
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
			{ showAttachmentButton && (
				<DropZone
					onFilesDrop={ onFilesDrop }
					label={ __( 'Share this image with our Happiness Engineers', __i18n_text_domain__ ) }
				/>
			) }
		</>
	);
};
