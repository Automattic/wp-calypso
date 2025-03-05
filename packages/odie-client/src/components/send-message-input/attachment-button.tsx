import {
	useAttachFileToConversation,
	useAuthenticateZendeskMessaging,
} from '@automattic/zendesk-client';
import { FormFileUpload, Spinner } from '@wordpress/components';
import { useCallback, useEffect } from '@wordpress/element';
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

export const AttachmentButton: React.FC< {
	attachmentButtonRef?: React.RefObject< HTMLElement >;
	externalFile?: File | null;
	inferredClientId?: string;
} > = ( { attachmentButtonRef, externalFile, inferredClientId } ) => {
	const { chat, addMessage, trackEvent, isUserEligibleForPaidSupport } = useOdieAssistantContext();
	const { data: authData } = useAuthenticateZendeskMessaging(
		isUserEligibleForPaidSupport,
		'messenger'
	);
	const { isPending: isAttachingFile, mutateAsync: attachFileToConversation } =
		useAttachFileToConversation();
	const onFileUpload = useCallback(
		async ( file: File | undefined ) => {
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

	useEffect( () => {
		if ( externalFile ) {
			onFileUpload( externalFile );
		}
	}, [ externalFile ] );

	return (
		<FormFileUpload
			accept="image/*"
			onChange={ ( event ) => {
				onFileUpload( event?.currentTarget?.files?.[ 0 ] );
			} }
			disabled={ isAttachingFile }
		>
			{ isAttachingFile && <Spinner style={ { margin: 0 } } /> }
			{ ! isAttachingFile && <Icon ref={ attachmentButtonRef } icon={ image } /> }
		</FormFileUpload>
	);
};
