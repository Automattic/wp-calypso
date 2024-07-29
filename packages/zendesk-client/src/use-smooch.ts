import { useEffect, useState } from 'react';
import Smooch from 'smooch';
import { SMOOCH_CONTAINER_ID, SMOOCH_INTEGRATION_ID } from './constants';
import { useAuthenticateZendeskMessaging } from './use-authenticate-zendesk-messaging';

export const useSmooch = () => {
	const [ init, setInit ] = useState(
		!! document.getElementById( SMOOCH_CONTAINER_ID )?.querySelector( 'iframe' )
	);
	const { data: authData } = useAuthenticateZendeskMessaging( true, 'messenger' );
	const [ addMessage, setAddMessage ] =
		useState< ( message: { text: string; role: string } ) => void >();

	useEffect( () => {
		const messengerContainer = document.getElementById( SMOOCH_CONTAINER_ID );
		if ( authData?.jwt && authData?.externalId && ! init ) {
			Smooch.init( {
				integrationId: SMOOCH_INTEGRATION_ID,
				embedded: true,
				externalId: authData.externalId,
				jwt: authData.jwt,
			} ).then( () => {
				setInit( true );
			} );
			if ( messengerContainer ) {
				Smooch.render( messengerContainer );
			}
		}
	}, [ authData?.externalId, authData?.jwt, init ] );

	if ( ! init ) {
		return {
			init: false,
			destroy: () => {},
			getConversation: () => undefined,
			createConversation: () => {},
			addMessengerListener: () => {},
			sendMessage: () => {},
		};
	}

	const getConversation = async ( chatId?: number ): Promise< Conversation | undefined > => {
		if ( init && chatId ) {
			const existingConversation = Smooch.getConversations().find( ( conversation ) => {
				return conversation.metadata[ 'odieChatId' ] === chatId;
			} );
			if ( ! existingConversation ) {
				return;
			}
			const result = await Smooch.getConversationById( existingConversation.id );
			await new Promise( ( resolve ) => setTimeout( resolve, 5000 ) );
			return result;
		}
		return;
	};

	const createConversation = async ( metadata: Conversation[ 'metadata' ] ) => {
		if ( init ) {
			await Smooch.createConversation( { metadata } );
		}
	};

	const addMessengerListener = ( callback: ( message: Message ) => void ) => {
		if ( init ) {
			Smooch.on( 'message:received', callback );
		}
		setAddMessage( () => callback );
	};

	const sendMessage = ( message: string, chatId?: number | null ) => {
		if ( chatId && init ) {
			const conversation = Smooch.getConversations().find( ( conversation ) => {
				return conversation.metadata[ 'odieChatId' ] === chatId;
			} );
			if ( ! conversation ) {
				return;
			}
			Smooch.sendMessage( { type: 'text', text: message }, conversation.id );
			addMessage?.( { text: message, role: 'user' } );
		}
	};

	return {
		init,
		destroy: Smooch.destroy,
		getConversation,
		createConversation,
		addMessengerListener,
		sendMessage,
	};
};
