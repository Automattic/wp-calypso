import {
	useAttachFileToConversation,
	useAuthenticateZendeskMessaging,
} from '@automattic/zendesk-client';
import { FormFileUpload } from '@wordpress/components';
import { useCallback } from '@wordpress/element';
import { Icon, upload } from '@wordpress/icons';
import React from 'react';
import { useOdieAssistantContext } from '../../context';
import { zendeskMessageConverter } from '../../utils';

const getFileType = ( file: File ) => {
	if ( file.type.includes( 'image' ) ) {
		return 'image';
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
	const { chat, setChatStatus, shouldUseHelpCenterExperience, addMessage } =
		useOdieAssistantContext();
	const { data: authData } = useAuthenticateZendeskMessaging( true, 'messenger' );
	const { isPending: isAttachingFile, mutateAsync: attachFileToConversation } =
		useAttachFileToConversation();

	const onFileUpload = useCallback(
		async ( event: React.ChangeEvent< HTMLInputElement > ) => {
			if ( authData && chat.conversationId && chat.clientId && event.currentTarget.files?.length ) {
				const file = event.currentTarget.files[ 0 ];
				setChatStatus( 'loading' );
				attachFileToConversation( {
					authData,
					file,
					conversationId: chat.conversationId,
					clientId: chat.clientId,
				} )
					.then( () => {
						addMessage( getPlaceholderAttachmentMessage( file ) );
					} )
					.finally( () => {
						setChatStatus( 'loaded' );
					} );
			}
		},
		[ chat.conversationId, authData ]
	);

	if ( ! chat.conversationId || ! chat.clientId || ! shouldUseHelpCenterExperience ) {
		return null;
	}

	return (
		<FormFileUpload accept="image/*" onChange={ onFileUpload } disabled={ isAttachingFile }>
			<Icon icon={ upload } />
		</FormFileUpload>
	);
};
