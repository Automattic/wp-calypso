import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import {
	useAttachFileToConversation,
	useAuthenticateZendeskMessaging,
} from '@automattic/zendesk-client';
import { DropZone, Icon } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { image } from '@wordpress/icons';
import { getOdieWrongFileTypeMessage } from '../../constants';
import { useOdieAssistantContext } from '../../context';
import { zendeskMessageConverter } from '../../utils';
import { AttachmentPreviews } from '../attachment-preview';

const SUPPORTED_IMAGE_TYPES = [ 'image/png', 'image/jpg', 'image/jpeg', 'image/gif' ];
const MAX_ATTACHMENTS = 5;

function isSupportedImageType( type: string ) {
	return SUPPORTED_IMAGE_TYPES.includes( type );
}

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
		text: '',
		id: String( new Date().getTime() ),
		received: new Date().getTime(),
		source: { type: 'web', id: '', integrationId: '' },
		mediaUrl: URL.createObjectURL( file ),
	} );
};

export const useAttachmentHandler = () => {
	const { trackEvent, chat, addMessage, isUserEligibleForPaidSupport } = useOdieAssistantContext();
	const [ attachmentPreviewFiles, setAttachmentPreviewFiles ] = useState< File[] >( [] );

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
		async ( files: File[] ) => {
			const limitedFiles = files.slice( 0, MAX_ATTACHMENTS );
			const newAttachmentPreviewFiles = [ ...attachmentPreviewFiles ];
			for ( const file of limitedFiles ) {
				if ( isSupportedImageType( file.type ) ) {
					// Avoid duplicates.
					if ( ! newAttachmentPreviewFiles.some( ( f ) => f.name === file.name ) ) {
						newAttachmentPreviewFiles.push( file );
					}
				} else {
					addMessage( getOdieWrongFileTypeMessage( file.name ) );
				}
			}
			setAttachmentPreviewFiles( newAttachmentPreviewFiles );
		},

		[ addMessage, setAttachmentPreviewFiles, attachmentPreviewFiles ]
	);

	const sendAttachments = useCallback( async () => {
		if ( attachmentPreviewFiles.length > 0 ) {
			if ( authData && chat.conversationId && inferredClientId ) {
				Promise.all(
					attachmentPreviewFiles.map( ( file ) =>
						attachFileToConversation( {
							authData,
							file,
							conversationId: chat.conversationId as string,
							clientId: inferredClientId,
						} ).then( () => {
							addMessage( getPlaceholderAttachmentMessage( file ) );
							trackEvent( 'send_message_attachment', { type: file.type } );
						} )
					)
				).then( () => {
					setAttachmentPreviewFiles( [] );
				} );
			}
		}
	}, [
		attachmentPreviewFiles,
		attachFileToConversation,
		authData,
		chat.conversationId,
		inferredClientId,
		addMessage,
		trackEvent,
	] );

	const onFilesDrop = ( files: File[] ) => {
		if ( files.length > 0 ) {
			handleFileUpload( files );
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
									if ( isSupportedImageType( type ) ) {
										item.getType( type ).then( ( blob ) => {
											const file = new File( [ blob ], 'pasted-image.png', { type } );
											handleFileUpload( [ file ] );
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
		icon: <Icon size={ 18 } icon={ image } />,
		onClick: () => {
			const input = document.createElement( 'input' );
			input.type = 'file';
			input.multiple = true;
			input.accept = 'image/png, image/jpg, image/jpeg, image/gif';
			input.onchange = ( e ) => {
				const files = ( e.target as HTMLInputElement ).files;
				if ( files?.length ) {
					handleFileUpload( Array.from( files ) );
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
		sendAttachments,
		attachmentPreviews: attachmentPreviewFiles.length ? (
			<AttachmentPreviews
				attachmentPreviews={ attachmentPreviewFiles }
				isAttachingFile={ isAttachingFile }
				onCancel={ ( index ) =>
					setAttachmentPreviewFiles( attachmentPreviewFiles.filter( ( _, i ) => i !== index ) )
				}
			/>
		) : null,
		handleImagePaste,
		attachmentAction,
		isAttachingFile,
		showAttachmentButton,
		AttachmentDropZone,
	};
};
