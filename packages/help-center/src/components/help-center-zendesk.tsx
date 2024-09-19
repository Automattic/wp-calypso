import { useOdieAssistantContext } from '@automattic/odie-client';
import { useSmooch } from '@automattic/zendesk-client';
import { useEffect, useState } from 'react';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';

export const HelpCenterZendesk = ( {
	setMessageHandler,
	messageHandler,
}: {
	setMessageHandler: any;
	messageHandler: any;
} ) => {
	const [ whoAreWeTalkingTo, setWhoAreWeTalkingTo ] = useState< 'odie' | 'human' >( 'odie' );
	const { chat, addMessage, clearChat } = useOdieAssistantContext();
	const { site } = useHelpCenterContext();
	const { createConversation, addMessengerListener, sendMessage } = useSmooch();

	const interceptedUserMessageHandler = ( message: any ) => {
		if ( sendMessage ) {
			sendMessage( message?.content );
		}
	};

	const forwardedZendeskMessageHandler = ( message: any ) => {
		if ( addMessage ) {
			addMessage( {
				content: message?.text,
				role: 'human',
				type: 'message',
			} );
		}
	};

	// Listen for the transfer to human event.
	useEffect( () => {
		const lastMessage = chat.messages[ chat.messages.length - 1 ];

		if ( lastMessage?.context?.flags?.forward_to_human_support ) {
			clearChat();
			setWhoAreWeTalkingTo( 'human' );
			if ( createConversation ) {
				createConversation(
					{
						messaging_initial_message: 'Passing in from Odie',
						messaging_source: 'help-center',
						messaging_site_id: site?.ID as number,
					},
					{ odieChatId: chat.chat_id as number }
				);
			}
		}
	}, [ chat.messages ] );

	// Switch to human
	useEffect( () => {
		if ( whoAreWeTalkingTo === 'human' && ! messageHandler ) {
			setMessageHandler( interceptedUserMessageHandler );
			if ( addMessengerListener ) {
				addMessengerListener( forwardedZendeskMessageHandler );
			}
		}
	}, [ whoAreWeTalkingTo ] );

	return null;
};
