import { useCallback, useEffect, useState } from 'react';
import Smooch from 'smooch';
import { SMOOCH_CONTAINER_ID } from './constants';
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
				integrationId: '6453b7fc45cea5c267e60fed',
				embedded: true,
				businessIconUrl: 'https://wpcomsupport.zendesk.com/embeddable/avatars/19034438422164',
				customColors: {
					brandColor: '0675C4',
				},
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

	const destroy = useCallback( () => {
		if ( init ) {
			Smooch.destroy?.();
		}
	}, [ init ] );

	const getConversation = useCallback(
		async ( chatId?: number ): Promise< Conversation | undefined > => {
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
		},
		[ init ]
	);

	const createConversation = useCallback(
		async ( metadata: Conversation[ 'metadata' ] ) => {
			if ( init ) {
				await Smooch.createConversation( { metadata } );
			}
		},
		[ init ]
	);

	const addMessengerListener = useCallback(
		( callback: ( message: Message ) => void ) => {
			if ( init ) {
				Smooch.on( 'message:received', callback );
			}
			setAddMessage( () => callback );
		},
		[ init ]
	);

	const sendMessage = useCallback(
		( message: string, chatId?: number | null ) => {
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
		},
		[ addMessage, init ]
	);

	return {
		init,
		destroy,
		getConversation,
		createConversation,
		addMessengerListener,
		sendMessage,
	};
};
