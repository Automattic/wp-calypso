import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { cn } from '../../utils/classNames';
import { getVisibleMessages } from '../../utils/message-helpers';
import { SourcesCard } from '../sources';
import { Message } from './Message';
import styles from './Messages.module.css';
import { ThinkingMessage } from './ThinkingMessage';
import type { Message as MessageType } from '../../types';
import type { ComponentType } from 'react';

interface MessagesProps {
	messages: MessageType[];
	isProcessing?: boolean;
	error?: string | null;
	emptyView?: React.ReactNode;
	messageRenderer?: ComponentType< { children: string } >;
	thinkingMessage?: string;
	className?: string;
	messagesPosition?: 'top' | 'bottom';
	showAgentIcon?: boolean;
}

function getSpokenText( element: Element | null | undefined ): string {
	if ( ! element ) {
		return '';
	}
	const walker = element.ownerDocument.createTreeWalker( element, NodeFilter.SHOW_TEXT, {
		acceptNode: ( node ) => {
			const hidden = node.parentElement?.closest( '[aria-hidden="true"]' );
			return hidden && element.contains( hidden )
				? NodeFilter.FILTER_REJECT
				: NodeFilter.FILTER_ACCEPT;
		},
	} );
	const parts: string[] = [];
	while ( walker.nextNode() ) {
		parts.push( walker.currentNode.textContent ?? '' );
	}
	return parts.join( ' ' ).replace( /\s+/g, ' ' ).trim();
}

export function Messages( {
	messages,
	isProcessing,
	error,
	emptyView,
	messageRenderer,
	thinkingMessage,
	messagesPosition = 'top',
	showAgentIcon,
}: MessagesProps ) {
	const scrollAreaRef = useRef< HTMLDivElement >( null );

	// Filter out context messages (type: 'context' should not be displayed in UI)
	const visibleMessages = getVisibleMessages( messages );

	useAutoScroll( { scrollAreaRef, visibleMessages } );

	const liveRegionText = useMemo( () => {
		// Find the last agent message
		const agentMessages = visibleMessages.filter( ( msg ) => msg.role === 'agent' );

		if ( ! agentMessages.length ) {
			return '';
		}

		const latestAgentMessage = agentMessages[ agentMessages.length - 1 ];

		return latestAgentMessage.content
			.filter( ( block ) => block.type === 'text' )
			.map( ( block ) => block.text )
			.join( ' ' );
	}, [ visibleMessages ] );

	const [ settledText ] = useDebounce( liveRegionText, 1000 );

	// Hide the indicator only while text is actively arriving, not just because
	// an agent message exists. We compare current agent text to its 1s debounced
	// shadow: equal means streaming has paused (indicator visible during tool-call
	// gaps); unequal means deltas are flowing (indicator hidden). The 1s window
	// is chosen to comfortably exceed typical inter-delta cadence (~430ms) so
	// the indicator does not flicker during steady streaming.
	const isAgentTextStreaming = liveRegionText !== settledText;

	// Announce the rendered reply once it finishes: what is on screen rather than
	// markdown source, and never history that was already there on open.
	const [ announcement, setAnnouncement ] = useState( '' );
	const textWhenProcessingStartedRef = useRef< string | null >( null );
	useEffect( () => {
		if ( isProcessing ) {
			textWhenProcessingStartedRef.current ??= liveRegionText;
			return;
		}
		const textWhenStarted = textWhenProcessingStartedRef.current;
		textWhenProcessingStartedRef.current = null;
		if ( textWhenStarted === null || textWhenStarted === liveRegionText ) {
			return;
		}
		const agentMessages = scrollAreaRef.current?.querySelectorAll(
			'[data-slot="message"][data-role="agent"]'
		);
		const latest = agentMessages?.[ agentMessages.length - 1 ];
		setAnnouncement( getSpokenText( latest?.querySelector( '[data-slot="message-bubble"]' ) ) );
	}, [ isProcessing, liveRegionText ] );

	if ( visibleMessages.length === 0 && ! isProcessing ) {
		if ( emptyView ) {
			return (
				<div
					data-slot="messages"
					className={ cn(
						styles.container,
						styles.emptyState,
						messagesPosition === 'bottom' ? styles.bottomMessages : ''
					) }
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
				{ announcement }
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
					{ visibleMessages.flatMap( ( message ) => {
						const nodes = [
							<Message
								key={ message.reactKey || message.id }
								message={ message }
								messageRenderer={ messageRenderer }
								showAgentIcon={ showAgentIcon }
							/>,
						];
						if ( message.role === 'agent' && message.sources?.length ) {
							nodes.push(
								<SourcesCard
									key={ `${ message.reactKey || message.id }-sources` }
									sources={ message.sources }
								/>
							);
						}
						return nodes;
					} ) }
					{ isProcessing && ! isAgentTextStreaming && (
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
