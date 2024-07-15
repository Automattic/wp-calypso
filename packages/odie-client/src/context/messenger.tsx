/**
 * External Dependencies
 */
import useMessagingAuth from '@automattic/help-center/src/hooks/use-messaging-auth';
import { useEffect, useState, createContext, useContext } from 'react';
import Smooch from 'smooch';
import { Message as OdieMessage } from '../types/';

const MessengerContext = createContext< {
	conversations: OdieMessage[];
	isLoading: boolean;
} >( {
	conversations: [],
	isLoading: true,
} );

export function useSupportMessenger() {
	return useContext( MessengerContext );
}

function translateMessages( originalMessages: Message[] ): OdieMessage[] {
	return originalMessages.filter( ( message ) => message.type === 'text' ).map( translateMessage );
}

function translateMessage( originalMessage: Message ): OdieMessage {
	const newRole = originalMessage.role === 'user' ? 'user' : 'agent';
	const newType = 'message';

	return {
		content: originalMessage.text,
		internal_message_id: originalMessage.id,
		message_id: parseInt( originalMessage.userId ), // Assuming userId can be converted to a number
		role: newRole,
		type: newType,
	};
}

export const SupportMessenger: React.FC< React.PropsWithChildren > = ( { children } ) => {
	const [ conversations, setConversations ] = useState< OdieMessage[] >( [] );
	const [ isLoading, setIsLoading ] = useState( true );
	const { data: authData } = useMessagingAuth( true, 'messenger' );

	useEffect( () => {
		Smooch.init( {
			integrationId: '6453b7fc45cea5c267e60fed',
			embedded: true,
			configBaseUrl: 'https://wpcomsupport.zendesk.com/sc/sdk',
			businessIconUrl: 'https://wpcomsupport.zendesk.com/embeddable/avatars/19034438422164',
			customColors: {
				brandColor: '0675C4',
			},
			externalId: authData?.externalId,
			jwt: authData?.jwt,
		} as InitOptions ).then( () => {
			console.log( 'Smooch initialized', Smooch );
			const messengerConversations = Smooch.getConversations();
			setConversations( translateMessages( messengerConversations?.[ 0 ]?.messages || [] ) );
			setIsLoading( false );
		} );
		const messengerContainer = document.getElementById( 'messenger-container' );
		if ( messengerContainer ) {
			Smooch.render( messengerContainer );
		}
		return () => {
			Smooch.destroy();
		};
	}, [] );

	return (
		<>
			<MessengerContext.Provider value={ { conversations, isLoading } }>
				{ children }
			</MessengerContext.Provider>
			<div className="help-center__container-content-odie" style={ { display: 'none' } }>
				<div id="messenger-container"></div>
			</div>
		</>
	);
};
