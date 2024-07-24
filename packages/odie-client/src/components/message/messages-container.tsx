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
		const targetMessageIndex = useMemo( () => {
			return chat.messages.length >= 2 ? chat.messages.length - 2 : chat.messages.length - 1;
		}, [ chat.messages ] );

		if ( chat.messages.length === 0 ) {
			return <div ref={ ref } className="odie-referenced-message"></div>;
		}

		return (
			<>
				{ chat.messages.map( ( message, index ) =>
					index === targetMessageIndex ? (
						<div ref={ ref } className="odie-referenced-message" key={ index }>
							<ChatMessage message={ message } currentUser={ currentUser } />
						</div>
					) : (
						<ChatMessage message={ message } key={ index } currentUser={ currentUser } />
					)
				) }
			</>
		);
	}
);
