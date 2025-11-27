import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import {
	useAttachFileToConversation,
	useAuthenticateZendeskMessaging,
	zendeskMessageConverter,
} from '@automattic/zendesk-client';
import { DropZone } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback, useState } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { error, image, Icon } from '@wordpress/icons';
import { useOdieAssistantContext } from '../../context';
import { AttachmentPreviews } from '../attachment-preview';

const NOTICE_BAD_FORMAT = {
	icon: <Icon size={ 24 } icon={ error } />,
	message: __( 'Only .jpg, .png, or .gif files are supported.', __i18n_text_domain__ ),
	dismissible: true,
	onDismiss: () => {},
};

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
		metadata: {
			temporary_id: crypto.randomUUID(),
			local_timestamp: Date.now() / 1000,
		},
		source: { type: 'web', id: '', integrationId: '' },
		mediaUrl: URL.createObjectURL( file ),
	} );
};

export const useAttachmentHandler = () => {
	const { trackEvent, chat, addMessage, isUserEligibleForPaidSupport } = useOdieAssistantContext();
	const [ attachmentPreviewFiles, setAttachmentPreviewFiles ] = useState< File[] >( [] );
	const [ badFormatNotice, setBadFormatNotice ] = useState< typeof NOTICE_BAD_FORMAT >();

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
			setBadFormatNotice( undefined );
			const limitedFiles = files.slice( 0, MAX_ATTACHMENTS );
			const newAttachmentPreviewFiles = [ ...attachmentPreviewFiles ];
			let anyUnsupportedFormats = false;
			for ( const file of limitedFiles ) {
				if ( isSupportedImageType( file.type ) ) {
					// Avoid duplicates.
					if ( ! newAttachmentPreviewFiles.some( ( f ) => f.name === file.name ) ) {
						newAttachmentPreviewFiles.push( file );
					}
				} else {
					anyUnsupportedFormats = true;
				}
			}
			setAttachmentPreviewFiles( newAttachmentPreviewFiles );
			if ( anyUnsupportedFormats ) {
				setBadFormatNotice( {
					...NOTICE_BAD_FORMAT,
					onDismiss: () => setBadFormatNotice( undefined ),
				} );
			}
		},

		[ setAttachmentPreviewFiles, attachmentPreviewFiles, setBadFormatNotice ]
	);

	const sendAttachments = useCallback( async () => {
		setBadFormatNotice( undefined );
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
		setBadFormatNotice,
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
		disabled:
			isAttachingFile ||
			( isLiveChat && [ 'disconnected', 'reconnecting' ].includes( connectionStatus ?? '' ) ),
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
		badFormatNotice,
		handleImagePaste,
		attachmentAction,
		isAttachingFile,
		showAttachmentButton,
		AttachmentDropZone,
	};
};
