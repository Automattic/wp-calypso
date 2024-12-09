import { HelpCenterSelect } from '@automattic/data-stores';
import { HELP_CENTER_STORE } from '@automattic/help-center/src/stores';
import {
	useAttachFileToConversation,
	useAuthenticateZendeskMessaging,
} from '@automattic/zendesk-client';
import { FormFileUpload, Spinner } from '@wordpress/components';
import { useSelect } from '@wordpress/data';
import { useCallback } from '@wordpress/element';
import { Icon, image } from '@wordpress/icons';
import React from 'react';
import { useOdieAssistantContext } from '../../context';
import { zendeskMessageConverter } from '../../utils';

const getFileType = ( file: File ) => {
	if ( file.type.includes( 'image' ) ) {
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

export const AttachmentButton: React.FC = () => {
	const { chat, addMessage, trackEvent } = useOdieAssistantContext();
	const { data: authData } = useAuthenticateZendeskMessaging( true, 'messenger' );
	const { isPending: isAttachingFile, mutateAsync: attachFileToConversation } =
		useAttachFileToConversation();
	const { zendeskClientId } = useSelect( ( select ) => {
		const helpCenterSelect: HelpCenterSelect = select( HELP_CENTER_STORE );
		return {
			zendeskClientId: helpCenterSelect.getZendeskClientId(),
		};
	}, [] );

	const inferredClientId = chat.clientId ? chat.clientId : zendeskClientId;
	const onFileUpload = useCallback(
		async ( event: React.ChangeEvent< HTMLInputElement > ) => {
			if (
				authData &&
				chat.conversationId &&
				inferredClientId &&
				event.currentTarget.files?.length
			) {
				const file = event.currentTarget.files[ 0 ];
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

	if ( ! chat.conversationId || ! inferredClientId ) {
		return null;
	}

	return (
		<FormFileUpload accept="image/*" onChange={ onFileUpload } disabled={ isAttachingFile }>
			{ isAttachingFile && <Spinner style={ { margin: 0 } } /> }
			{ ! isAttachingFile && <Icon icon={ image } /> }
		</FormFileUpload>
	);
};
