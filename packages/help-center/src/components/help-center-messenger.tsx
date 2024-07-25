/**
 * External Dependencies
 */
import { useEffect, useState, createContext, useContext, useCallback } from 'react';
import Smooch from 'smooch';
// import useMessagingAuth from '../hooks/use-messaging-auth';

const MessengerContext = createContext<
	| {
			getConversations: () => Conversation[];
			createConversation: ( metadata: Conversation[ 'metadata' ] ) => Promise< void >;
			addMessengerListener: ( callback: any ) => void;
			sendMessage: ( message: string, chatId?: number | null ) => void;
	  }
	| Record< string, never >
>( {} );

type Props = React.PropsWithChildren< {
	chatId?: string;
} >;

export function useHelpCenterMessenger() {
	return useContext( MessengerContext );
}

export const HelpCenterMessenger: React.FC< Props > = ( { children } ) => {
	const [ init, setInit ] = useState( false );
	const [ addMessage, setAddMessage ] = useState< ( message: any ) => void >();
	// const { data: authData } = useMessagingAuth( true, 'messenger' );
	const authData = { externalId: '', jwt: '' };

	useEffect( () => {
		if ( authData?.jwt && authData?.externalId ) {
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
				setInit( true );
			} );
			const messengerContainer = document.getElementById( 'messenger-container' );
			if ( messengerContainer ) {
				Smooch.render( messengerContainer );
			}
		}
		return () => {
			Smooch.destroy?.();
		};
	}, [ authData?.externalId, authData?.jwt ] );

	const getConversations = useCallback( (): Conversation[] => {
		if ( init ) {
			return Smooch.getConversations();
		}
		return [];
	}, [ init ] );

	const createConversation = useCallback(
		async ( metadata: Conversation[ 'metadata' ] ) => {
			if ( init ) {
				await Smooch.createConversation( {
					metadata,
				} );
			}
		},
		[ init ]
	);

	const addMessengerListener = useCallback(
		( callback: any ) => {
			if ( init ) {
				Smooch.on( 'message:received', callback );
				setAddMessage( callback );
			}
		},
		[ init ]
	);

	const sendMessage = useCallback(
		( message: string, chatId?: number | null ) => {
			if ( init && chatId ) {
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
		[ init, addMessage ]
	);

	return (
		<>
			<MessengerContext.Provider
				value={ { getConversations, createConversation, addMessengerListener, sendMessage } }
			>
				{ children }
			</MessengerContext.Provider>
			<div className="help-center__container-content-odie" style={ { display: 'none' } }>
				<div id="messenger-container"></div>
			</div>
		</>
	);
};
