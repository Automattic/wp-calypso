import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import type { ComponentType } from 'react';
import type { Message as MessageType } from '../../types';
import { Message } from './Message';
import styles from './Messages.module.css';
import { ThinkingMessage } from './ThinkingMessage';
import { getVisibleMessages } from '../../utils/message-helpers';
import { useDebounce } from 'use-debounce';

interface MessagesProps {
	messages: MessageType[];
	isProcessing?: boolean;
	error?: string | null;
	emptyView?: React.ReactNode;
	messageRenderer?: ComponentType< { children: string } >;
	className?: string;
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

	// Filter out context messages (type: 'context' should not be displayed in UI)
	const visibleMessages = getVisibleMessages( messages );

	const liveRegionText = useMemo( () => {
		// Find the last agent message
		const agentMessages = visibleMessages.filter(
			( msg ) => msg.role === 'agent'
		);

		if ( ! agentMessages.length ) {
			return '';
		}

		const latestAgentMessage = agentMessages[ agentMessages.length - 1 ];

		return latestAgentMessage.content
			.filter( ( block ) => block.type === 'text' )
			.map( ( block ) => block.text )
			.join( ' ' );
	}, [ visibleMessages ] );

	// Debounce live region updates to prevent repeated announcements during streaming
	const [ announcedText ] = useDebounce( liveRegionText, 1000 );

	useEffect( () => {
		// Check if a new message was added
		const hasNewMessage =
			visibleMessages.length > previousMessagesRef.current.length;

		// Handle initial render - always scroll to bottom instantly when expanding
		if (
			isFirstRender.current &&
			visibleMessages.length > 0 &&
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

		if ( isFirstRender.current ) {
			isFirstRender.current = false;
		}

		previousMessagesRef.current = visibleMessages;
	}, [ visibleMessages ] );

	if ( visibleMessages.length === 0 ) {
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
				aria-live="polite"
				aria-atomic="true"
				style={ {
					position: 'absolute',
					left: '-10000px',
					width: '1px',
					height: '1px',
					overflow: 'hidden',
				} }
			>
				{ announcedText }
			</div>
			<div
				data-slot="messages"
				className={ styles.container }
				ref={ scrollAreaRef }
			>
				<AnimatePresence mode="popLayout">
					{ visibleMessages.map( ( message ) => (
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
