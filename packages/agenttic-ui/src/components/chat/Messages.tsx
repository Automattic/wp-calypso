import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef } from 'react';
import type { ComponentType } from 'react';
import type { Message as MessageType } from '../../types';
import { cn } from '../../utils/classNames';
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
	thinkingMessage?: string;
	className?: string;
	messagesPosition?: 'top' | 'bottom';
}

export function Messages( {
	messages,
	isProcessing,
	error,
	emptyView,
	messageRenderer,
	thinkingMessage,
	messagesPosition = 'top',
}: MessagesProps ) {
	const scrollAreaRef = useRef< HTMLDivElement >( null );
	const previousMessagesRef = useRef< MessageType[] >( [] );
	const isFirstRender = useRef( true );

	// Filter out context messages (type: 'context' should not be displayed in UI)
	const visibleMessages = getVisibleMessages( messages );

	// Check if we have an agent message being streamed
	// If so, hide the thinking indicator since content is arriving
	const hasAgentResponse =
		visibleMessages.length > 0 &&
		visibleMessages[ visibleMessages.length - 1 ].role === 'agent';

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

	if ( visibleMessages.length === 0 && ! isProcessing ) {
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
				className={ cn(
					styles.container,
					messagesPosition === 'bottom' ? styles.bottomMessages : ''
				) }
				ref={ scrollAreaRef }
			>
				<AnimatePresence mode="popLayout">
					{ visibleMessages.map( ( message ) => (
						<Message
							key={ message.reactKey || message.id }
							message={ message }
							messageRenderer={ messageRenderer }
						/>
					) ) }
					{ isProcessing && ! hasAgentResponse && (
						<ThinkingMessage content={ thinkingMessage } />
					) }
					{ error && (
						<div
							className="error-message"
							style={ {
								color: 'var(--color-error)',
								padding: 'var(--spacing-4)',
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
