import { AnimatePresence } from 'framer-motion';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useDebounce } from 'use-debounce';
import { useAutoScroll } from '../../hooks/useAutoScroll';
import { cn } from '../../utils/classNames';
import {
	getHiddenReplyId,
	getLatestTurnStartIndex,
	getVisibleMessages,
} from '../../utils/message-helpers';
import { SourcesCard } from '../sources';
import { Message } from './Message';
import { MessageCard } from './MessageCard';
import styles from './Messages.module.css';
import { Notice } from './Notice';
import { ThinkingMessage } from './ThinkingMessage';
import type { Message as MessageType, NoticeConfig } from '../../types';
import type { ComponentType } from 'react';

interface MessagesProps {
	messages: MessageType[];
	isProcessing?: boolean;
	/** Whether the latest reply is still streaming. Defaults to `isProcessing`. */
	isStreaming?: boolean;
	/** Whether reply text is streaming in. When set, it drives the thinking indicator. */
	isReplying?: boolean;
	error?: string | null;
	errorNotice?: NoticeConfig;
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
			const parent = node.parentElement;
			const hidden = parent?.closest( '[aria-hidden="true"]' );

			return ( hidden && element.contains( hidden ) ) || parent?.checkVisibility?.() === false
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
	isStreaming = isProcessing,
	isReplying,
	error,
	errorNotice,
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

	const latestTurnStartIndex = getLatestTurnStartIndex( visibleMessages );

	const { latestAgentMessageId, liveRegionText } = useMemo( () => {
		const latestAgentMessage = visibleMessages.filter( ( msg ) => msg.role === 'agent' ).at( -1 );

		return {
			latestAgentMessageId: latestAgentMessage?.id ?? '',
			liveRegionText: ( latestAgentMessage?.content ?? [] )
				.filter( ( block ) => block.type === 'text' )
				.map( ( block ) => block.text )
				.join( ' ' ),
		};
	}, [ visibleMessages ] );

	const [ settledText ] = useDebounce( liveRegionText, 1000 );

	// Hide the indicator only while text is actively arriving, not just because
	// an agent message exists. We compare current agent text to its 1s debounced
	// shadow: equal means streaming has paused (indicator visible during tool-call
	// gaps); unequal means deltas are flowing (indicator hidden). The 1s window
	// is chosen to comfortably exceed typical inter-delta cadence (~430ms) so
	// the indicator does not flicker during steady streaming. `isReplying`, when
	// set, overrides this.
	const isAgentTextStreaming = isReplying ?? liveRegionText !== settledText;

	// Announce the rendered reply once it finishes, when the latest agent message
	// or its text changed during the turn: what is on screen rather than markdown
	// source, and never history that was already there on open. A hidden reply is
	// read when the host shows it.
	const [ announcement, setAnnouncement ] = useState( '' );
	const replyKey = `${ latestAgentMessageId }:${ liveRegionText }`;
	const hiddenReplyId = getHiddenReplyId( messages, visibleMessages );
	const replyWhenProcessingStartedRef = useRef< string | null >( null );
	const pendingReplyIdRef = useRef< string | null >( null );

	useEffect( () => {
		if ( isProcessing ) {
			replyWhenProcessingStartedRef.current ??= replyKey;
			// Emptied for the turn, so the same text is read out again when it ends.
			setAnnouncement( '' );
			return;
		}

		const replyWhenStarted = replyWhenProcessingStartedRef.current;
		replyWhenProcessingStartedRef.current = null;
		const pendingReplyId = pendingReplyIdRef.current;
		pendingReplyIdRef.current = null;

		if ( replyWhenStarted === replyKey ) {
			pendingReplyIdRef.current = hiddenReplyId;
			return;
		}

		// Outside a turn, read only the hidden reply now showing, matched by id so a conversation
		// switch or history load isn't read out.
		if ( replyWhenStarted === null && pendingReplyId !== latestAgentMessageId ) {
			return;
		}

		const agentMessages = scrollAreaRef.current?.querySelectorAll(
			'[data-slot="message"][data-role="agent"]'
		);
		const latest = agentMessages?.[ agentMessages.length - 1 ];
		setAnnouncement( getSpokenText( latest?.querySelector( '[data-slot="message-bubble"]' ) ) );
	}, [ isProcessing, replyKey, hiddenReplyId, latestAgentMessageId ] );

	// Announce the notice in the message list when it appears or changes, as with a reply.
	const noticeMessage =
		errorNotice && [ errorNotice.title, errorNotice.message ].filter( Boolean ).join( '. ' );
	const announcedNoticeRef = useRef( noticeMessage );
	useEffect( () => {
		if ( noticeMessage && noticeMessage !== announcedNoticeRef.current ) {
			setAnnouncement( noticeMessage );
		}
		announcedNoticeRef.current = noticeMessage;
	}, [ noticeMessage ] );

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
			{ /* Live region for announcing AI responses and the error notice - hidden from view */ }
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
					{ visibleMessages.flatMap( ( message, index ) => {
						const nodes = [
							<Message
								key={ message.reactKey || message.id }
								message={ message }
								messageRenderer={ messageRenderer }
								showAgentIcon={ showAgentIcon }
								isLatestTurn={ index >= latestTurnStartIndex }
								isStreaming={ isStreaming }
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
					{ /* A DOM element for the ref AnimatePresence's popLayout measures with. */ }
					{ errorNotice && (
						<div key="error-notice" className={ errorNotice.title ? styles.errorCard : undefined }>
							{ errorNotice.title ? (
								<MessageCard
									title={ errorNotice.title }
									description={ errorNotice.message }
									url={ errorNotice.action?.href }
									onClick={ errorNotice.action?.onClick }
								/>
							) : (
								<Notice { ...errorNotice } className={ styles.errorNotice } />
							) }
						</div>
					) }
				</AnimatePresence>
			</div>
		</>
	);
}
