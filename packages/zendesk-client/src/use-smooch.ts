import { recordTracksEvent } from '@automattic/calypso-analytics';
import { useState } from 'react';
import Smooch from 'smooch';
import { SMOOCH_INTEGRATION_ID } from './constants';
import { UserFields } from './types';
import { useAuthenticateZendeskMessaging } from './use-authenticate-zendesk-messaging';
import { useUpdateZendeskUserFields } from './use-update-zendesk-user-fields';

export const useSmooch = () => {
	const [ init, setInit ] = useState( typeof Smooch.getConversations === 'function' );
	const { data: authData } = useAuthenticateZendeskMessaging( true, 'messenger' );
	const { isPending: isSubmittingZendeskUserFields, mutateAsync: submitUserFields } =
		useUpdateZendeskUserFields();

	const initSmooch = ( ref: HTMLDivElement ) => {
		if ( authData?.jwt && authData?.externalId && ! Smooch.getConversations ) {
			Smooch.init( {
				integrationId: SMOOCH_INTEGRATION_ID,
				embedded: true,
				externalId: authData?.externalId,
				jwt: authData?.jwt,
			} )
				.then( () => {
					recordTracksEvent( 'calypso_smooch_messenger_init', {
						success: true,
						error: '',
					} );
					setInit( true );
				} )
				.catch( ( error ) => {
					recordTracksEvent( 'calypso_smooch_messenger_init', {
						success: false,
						error: error.message,
					} );
					setInit( false );
				} );
			Smooch.render( ref );
		}
	};

	const destroy = () => {
		Smooch.destroy();
	};

	if ( ! init ) {
		return {
			init,
			destroy,
			initSmooch,
			getConversation: async () => undefined,
			createConversation: async () => undefined,
			addMessengerListener: () => undefined,
			addUnreadCountListener: () => undefined,
			sendMessage: () => undefined,
		};
	}

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

	const createConversation = async (
		userfields: UserFields,
		metadata: Conversation[ 'metadata' ]
	) => {
		if ( isSubmittingZendeskUserFields ) {
			return;
		}
		if ( metadata.odieChatId ) {
			await submitUserFields( userfields );
			await Smooch.createConversation( { metadata } );
		}
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

	const addUnreadCountListener = ( callback: ( unreadCount: number ) => void ) => {
		Smooch.on( 'unreadCount', callback );
	};

	return {
		init,
		initSmooch,
		destroy,
		getConversation,
		createConversation,
		addMessengerListener,
		addUnreadCountListener,
		sendMessage,
	};
};
