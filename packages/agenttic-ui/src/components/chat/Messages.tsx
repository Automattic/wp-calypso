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
	messageRenderer?: ComponentType< { children: string } >;
}

export function Messages( {
	messages,
	isProcessing,
	error,
	emptyView,
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

		// Handle initial render - always scroll to bottom instantly when expanding
		if (
			isFirstRender.current &&
			messages.length > 0 &&
			scrollAreaRef.current
		) {
			scrollAreaRef.current.scrollTop =
				scrollAreaRef.current.scrollHeight;
		}
		// Handle new messages - scroll smoothly
		else if (
			hasNewMessage &&
			! isFirstRender.current &&
			scrollAreaRef.current
		) {
			scrollAreaRef.current.scrollTo( {
				top: scrollAreaRef.current.scrollHeight,
				behavior: 'smooth',
			} );
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
	}, [ messages ] );

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
