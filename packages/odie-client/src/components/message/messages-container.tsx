import { ForwardedRef, forwardRef, useMemo } from 'react';
import ChatMessage from '.';
import type { CurrentUser, Message } from '../../types/';

interface ChatMessagesProps {
	chat: {
		messages: Message[];
	};
	currentUser: CurrentUser;
}

export const MessagesContainer = forwardRef(
	( { chat, currentUser }: ChatMessagesProps, ref: ForwardedRef< HTMLDivElement > ) => {
		const lastMessageIndex = useMemo( () => chat.messages.length - 1, [ chat.messages ] );
		if ( chat.messages.length === 0 ) {
			return null;
		}

		return (
			<>
				{ chat.messages.slice( 0, lastMessageIndex ).map( ( message, index ) => (
					<ChatMessage message={ message } key={ index } currentUser={ currentUser } />
				) ) }
				<div ref={ ref } style={ { margin: 0, padding: 0, border: 0 } }>
					<ChatMessage message={ chat.messages[ lastMessageIndex ] } currentUser={ currentUser } />
				</div>
			</>
		);
	}
);
