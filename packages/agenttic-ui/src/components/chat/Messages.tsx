import { AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';
import type { ComponentType } from 'react';
import type { Message as MessageType } from '../../types';
import { Message } from './Message';
import styles from './Messages.module.css';
import { ThinkingMessage } from './ThinkingMessage';

interface MessagesProps {
	messages: MessageType[];
	isProcessing?: boolean;
	error?: string | null;
	emptyView?: React.ReactNode;
	fromCompact?: boolean;
	messageRenderer?: ComponentType< { children: string } >;
}

export function Messages( {
	messages,
	isProcessing,
	error,
	emptyView,
	fromCompact = false,
	messageRenderer,
}: MessagesProps ) {
	const scrollAreaRef = useRef< HTMLDivElement >( null );
	const previousMessagesRef = useRef< MessageType[] >( [] );
	const isFirstRender = useRef( true );
	const liveRegionRef = useRef< HTMLDivElement >( null );

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

		// Check if a new AI agent message was added for live region announcements
		if ( hasNewMessage && liveRegionRef.current ) {
			const newMessages = messages.slice(
				previousMessagesRef.current.length
			);
			const newAgentMessages = newMessages.filter(
				( msg ) => msg.role === 'agent'
			);

			if ( newAgentMessages.length > 0 ) {
				// Update live region with the latest agent message content
				const latestAgentMessage =
					newAgentMessages[ newAgentMessages.length - 1 ];
				const messageText = latestAgentMessage.content
					.filter( ( block ) => block.type === 'text' )
					.map( ( block ) => block.text )
					.join( ' ' );

				if ( messageText ) {
					liveRegionRef.current.textContent = messageText;
				}
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
		<>
			{ /* Live region for announcing AI responses - hidden from view */ }
			<div
				ref={ liveRegionRef }
				aria-live="polite"
				aria-atomic="true"
				style={ {
					position: 'absolute',
					left: '-10000px',
					width: '1px',
					height: '1px',
					overflow: 'hidden',
				} }
			/>
			<div
				data-slot="messages"
				className={ styles.container }
				ref={ scrollAreaRef }
			>
				<AnimatePresence mode="popLayout">
					{ messages.map( ( message ) => (
						<Message
							key={ message.id }
							message={ message }
							messageRenderer={ messageRenderer }
						/>
					) ) }
					{ isProcessing && <ThinkingMessage /> }
					{ error && (
						<div
							className="error-message"
							style={ {
								color: 'var(--color-destructive)',
								padding: '1rem',
								textAlign: 'center',
							} }
						>
							{ error }
						</div>
					) }
				</AnimatePresence>
			</div>
		</>
	);
}
