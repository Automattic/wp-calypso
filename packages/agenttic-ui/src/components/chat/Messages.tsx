import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { Message as MessageType } from '../../types';
import { Message } from './Message';
import styles from './Messages.module.css';
import { ThinkingMessage } from './ThinkingMessage';

interface MessagesProps {
	messages: MessageType[];
	isThinking?: boolean;
	error?: string | null;
	emptyView?: React.ReactNode;
	fromCompact?: boolean;
}

export function Messages( {
	messages,
	isThinking,
	error,
	emptyView,
	fromCompact = false,
}: MessagesProps ) {
	const scrollAreaRef = useRef< HTMLDivElement >( null );
	const previousMessagesRef = useRef< MessageType[] >( [] );
	const isFirstRender = useRef( true );

	useEffect( () => {
		// Check if a new message was added
		const hasNewMessage =
			messages.length > previousMessagesRef.current.length;

		if ( hasNewMessage && scrollAreaRef.current ) {
			// Find all message elements
			const messageElements = scrollAreaRef.current.querySelectorAll(
				'[data-slot="message"]'
			);
			const lastMessageElement =
				messageElements[ messageElements.length - 1 ];

			if ( lastMessageElement ) {
				// Scroll to the top of the last message
				const scrollTop =
					lastMessageElement.getBoundingClientRect().top -
					scrollAreaRef.current.getBoundingClientRect().top +
					scrollAreaRef.current.scrollTop;

				// Use instant scroll when coming from compact on first render
				const behavior =
					fromCompact && isFirstRender.current ? 'auto' : 'smooth';

				scrollAreaRef.current.scrollTo( {
					top: scrollTop,
					behavior: behavior as ScrollBehavior,
				} );
			}
		}

		if ( isFirstRender.current ) {
			isFirstRender.current = false;
		}

		previousMessagesRef.current = messages;
	}, [ messages, fromCompact ] );

	if ( messages.length === 0 ) {
		if ( emptyView ) {
			return (
				<div
					data-slot="messages"
					className={ `${ styles.container } ${ styles.emptyState }` }
					ref={ scrollAreaRef }
				>
					{ emptyView }
				</div>
			);
		}
		return null;
	}

	return (
		<div
			data-slot="messages"
			className={ styles.container }
			ref={ scrollAreaRef }
		>
			<AnimatePresence mode="popLayout">
				{ messages.map( ( message ) => (
					<Message key={ message.id } message={ message } />
				) ) }
				{ isThinking && <ThinkingMessage /> }
				{ error && (
					<Message
						message={ {
							id: 'error',
							role: 'error',
							content: [ { type: 'text', text: error } ],
							created_at: Date.now(),
							archived: false,
							showIcon: false,
						} }
					/>
				) }
			</AnimatePresence>
		</div>
	);
}
