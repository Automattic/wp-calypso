import { useSmooch } from '@automattic/zendesk-client';
import { useEffect, useRef } from 'react';
import { useOdieAssistantContext } from '../../context';
import { GetSupport } from '../get-support';
import ChatMessage from '.';
import type { CurrentUser, MessageType } from '../../types/';

export const MessagesContainer = ( { currentUser }: { currentUser: CurrentUser } ) => {
	const { addMessengerListener } = useSmooch();
	const { chat, provider, addMessage } = useOdieAssistantContext();
	const containerRef = useRef< HTMLDivElement >( null );
	const lastMessageIndex = chat.messages.length - 1;

	useEffect( () => {
		if ( provider === 'zendesk' ) {
			addMessengerListener?.( ( message ) => {
				addMessage( { content: message.text, role: 'human', type: 'message' } );
			} );
		}
	}, [ provider ] );

	useEffect( () => {
		if ( chat.messages.length > 0 ) {
			const lastMessage = containerRef.current?.querySelector( '.odie-chatbox-message-last' );
			if ( lastMessage ) {
				setTimeout( () => {
					lastMessage.scrollIntoView( { behavior: 'smooth' } );
				}, 100 );
			}
		}
	}, [ chat.messages ] );

	return (
		<div className="chatbox-messages" ref={ containerRef }>
			{ chat.messages.map( ( message, index ) => {
				const isLastMessage = lastMessageIndex === index;
				const isLastOfType = ( type: MessageType ) => isLastMessage && message.type === type;

				return (
					<>
						<ChatMessage
							message={ message }
							key={ index }
							currentUser={ currentUser }
							isLastUserMessage={ isLastMessage && message.role === 'user' }
							isLastFeedbackMessage={ isLastOfType( 'dislike-feedback' ) }
							isLastErrorMessage={ isLastOfType( 'error' ) }
							isLastMessage={ isLastMessage }
						/>
						{ isLastMessage && message?.context?.flags?.forward_to_human_support && <GetSupport /> }
					</>
				);
			} ) }
		</div>
	);
};
