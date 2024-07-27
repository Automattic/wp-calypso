import { Spinner } from '@automattic/components';
import { ForwardedRef, forwardRef, useEffect, useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { useOdieAssistantContext } from '../../context';
import ChatMessage from '.';
import type { CurrentUser, Message } from '../../types/';

interface ChatMessagesProps {
	chat: {
		messages: Message[];
		loading?: boolean;
	};
	currentUser: CurrentUser;
}

export const MessagesContainer = forwardRef(
	( { chat, currentUser }: ChatMessagesProps, ref: ForwardedRef< HTMLDivElement > ) => {
		const targetMessageIndex = useMemo( () => {
			return chat.messages.length >= 2 ? chat.messages.length - 2 : chat.messages.length - 1;
		}, [ chat.messages ] );
		const { setLastMessageInView } = useOdieAssistantContext();
		const { inView: lastMessageInView, ref: lastMessageWapuuRef } = useInView( {
			threshold: 0,
			delay: 800,
		} );

		useEffect( () => {
			if ( setLastMessageInView ) {
				setLastMessageInView( lastMessageInView || chat.messages.length < 2 );
			}
		}, [ chat.messages.length, lastMessageInView, setLastMessageInView ] );

		const lastMessageIndex = chat.messages.length - 1;

		if ( chat.loading ) {
			return (
				<div className="odie-loading-container" ref={ lastMessageWapuuRef }>
					<Spinner />
				</div>
			);
		}

		if ( chat.messages.length === 0 ) {
			return (
				<>
					<div ref={ ref } className="odie-referenced-message"></div>;
					<div className="odie-last-message" ref={ lastMessageWapuuRef }></div>
				</>
			);
		}

		return (
			<>
				{ chat.messages.map( ( message, index ) => {
					if ( index === targetMessageIndex ) {
						return (
							<div ref={ ref } className="odie-referenced-message" key={ index }>
								<ChatMessage message={ message } currentUser={ currentUser } />
							</div>
						);
					} else if ( index === lastMessageIndex ) {
						return (
							<div className="odie-last-message" key={ index } ref={ lastMessageWapuuRef }>
								<ChatMessage message={ message } currentUser={ currentUser } />
							</div>
						);
					}
					return <ChatMessage message={ message } key={ index } currentUser={ currentUser } />;
				} ) }
			</>
		);
	}
);
