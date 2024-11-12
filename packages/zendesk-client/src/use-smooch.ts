import config from '@automattic/calypso-config';
import { ZendeskConversation } from '@automattic/odie-client/src/types';
import { useCallback } from 'react';
import Smooch from 'smooch';
import { SMOOCH_INTEGRATION_ID, SMOOCH_INTEGRATION_ID_STAGING } from './constants';
import { UserFields } from './types';
import { useUpdateZendeskUserFields } from './use-update-zendesk-user-fields';

const destroy = () => {
	Smooch.destroy();
};

const getConversation = async ( chatId?: number ): Promise< Conversation | undefined > => {
	if ( chatId ) {
		const existingConversation = Smooch.getConversations?.().find( ( conversation ) => {
			return conversation.metadata[ 'odieChatId' ] === chatId;
		} );

		if ( ! existingConversation ) {
			return;
		}

		const result = await Smooch.getConversationById( existingConversation.id );
		if ( result ) {
			Smooch.markAllAsRead( result.id );
			return result;
		}
	}

	return;
};

const sendMessage = ( message: string, chatId?: number | null ) => {
	if ( chatId ) {
		const conversation = Smooch.getConversations().find( ( conversation ) => {
			return conversation.metadata[ 'odieChatId' ] === chatId;
		} );
		if ( ! conversation ) {
			return;
		}
		Smooch.sendMessage( { type: 'text', text: message }, conversation.id );
	}
};

const addMessengerListener = ( callback: ( message: Message ) => void ) => {
	Smooch.on( 'message:received', ( message, data ) => {
		callback( message );
		Smooch.markAllAsRead( data.conversation.id );
	} );
};

const initSmooch = ( {
	jwt,
	externalId,
}: {
	isLoggedIn: boolean;
	jwt: string;
	externalId: string | undefined;
} ) => {
	const currentEnvironment = config( 'env_id' );
	const isTestMode = currentEnvironment !== 'production';

	return Smooch.init( {
		integrationId: isTestMode ? SMOOCH_INTEGRATION_ID_STAGING : SMOOCH_INTEGRATION_ID,
		embedded: true,
		externalId,
		jwt,
	} );
};

const addUnreadCountListener = ( callback: ( unreadCount: number ) => void ) => {
	Smooch.on( 'unreadCount', callback );
};

const getConversations = () => {
	const conversations = Smooch.getConversations();
	return conversations as unknown as ZendeskConversation[];
};

export const useSmooch = () => {
	const { isPending: isSubmittingZendeskUserFields, mutateAsync: submitUserFields } =
		useUpdateZendeskUserFields();

	window.Smooch = Smooch;

	const createConversation = useCallback(
		async ( userfields: UserFields, metadata: Conversation[ 'metadata' ] ) => {
			if ( isSubmittingZendeskUserFields ) {
				return;
			}
			if ( metadata.odieChatId ) {
				await submitUserFields( userfields );
				await Smooch.createConversation( { metadata } );
			}
		},
		[ isSubmittingZendeskUserFields, submitUserFields ]
	);

	return {
		initSmooch,
		renderSmooch: Smooch.render,
		destroy,
		getConversation,
		getConversations,
		createConversation,
		addMessengerListener,
		addUnreadCountListener,
		sendMessage,
	};
};
