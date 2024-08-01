import { useEffect, useState } from 'react';
import Smooch from 'smooch';
import { SMOOCH_CONTAINER_ID, SMOOCH_INTEGRATION_ID } from './constants';
import { useAuthenticateZendeskMessaging } from './use-authenticate-zendesk-messaging';

export const useSmooch = () => {
	const [ init, setInit ] = useState( !! Smooch.getConversations?.() );
	const { data: authData } = useAuthenticateZendeskMessaging( true, 'messenger' );

	useEffect( () => {
		if ( authData?.jwt && authData?.externalId && ! Smooch.getConversations ) {
			const messengerContainer = document.getElementById( SMOOCH_CONTAINER_ID );
			Smooch.init( {
				integrationId: SMOOCH_INTEGRATION_ID,
				embedded: true,
				externalId: authData?.externalId,
				jwt: authData?.jwt,
			} ).then( () => {
				setInit( true );
			} );
			if ( messengerContainer ) {
				Smooch.render( messengerContainer );
			}
		}
	}, [ authData?.externalId, authData?.jwt, init ] );

	const destroy = () => {
		Smooch.destroy();
	};

	if ( ! init ) {
		return {
			init,
			destroy,
			getConversation: async () => undefined,
			createConversation: async () => undefined,
			addMessengerListener: async () => undefined,
			sendMessage: async () => undefined,
		};
	}

	const getConversation = async ( chatId?: number ): Promise< Conversation | undefined > => {
		if ( chatId ) {
			const existingConversation = Smooch.getConversations?.().find( ( conversation ) => {
				// return conversation.metadata[ 'odieChatId' ] === chatId;
				return conversation.metadata[ 'odieChatId' ] === 612050;
			} );
			if ( ! existingConversation ) {
				return;
			}
			const result = await Smooch.getConversationById( existingConversation.id );
			return result;
		}
		return;
	};

	const createConversation = async ( metadata: Conversation[ 'metadata' ] ) => {
		if ( metadata.odieChatId ) {
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
		Smooch.on( 'message:received', callback );
	};

	return {
		init,
		destroy,
		getConversation,
		createConversation,
		addMessengerListener,
		sendMessage,
	};
};
