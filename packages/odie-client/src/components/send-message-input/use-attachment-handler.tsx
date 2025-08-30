import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import {
	useAttachFileToConversation,
	useAuthenticateZendeskMessaging,
} from '@automattic/zendesk-client';
import { DropZone } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { image } from '@wordpress/icons';
import { getOdieWrongFileTypeMessage } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { zendeskMessageConverter } from '../../utils';

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

export const useAttachmentHandler = () => {
	const { trackEvent, chat, addMessage, isUserEligibleForPaidSupport } = useOdieAssistantContext();

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

	const showAttachmentButton = chat.conversationId && inferredClientId;
	const isLiveChat = chat.provider?.startsWith( 'zendesk' );

	// Handle paste events for images
	const handleImagePaste = useCallback(
		( e: React.KeyboardEvent< HTMLTextAreaElement > ) => {
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
		[ handleFileUpload ]
	);

	const AttachmentDropZone = () => {
		if ( ! showAttachmentButton ) {
			return null;
		}

		return (
			<DropZone
				onFilesDrop={ onFilesDrop }
				label={ __( 'Share this image with our Happiness Engineers', __i18n_text_domain__ ) }
			/>
		);
	};

	const attachmentAction = {
		id: 'attachment',
		icon: <Icon size="18" icon={ image } />,
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
		disabled: isAttachingFile || ( isLiveChat && connectionStatus !== 'connected' ),
		'aria-label': __( 'Attach file', __i18n_text_domain__ ),
	};

	return {
		handleFileUpload,
		handleImagePaste,
		attachmentAction,
		isAttachingFile,
		showAttachmentButton,
		AttachmentDropZone,
	};
};
