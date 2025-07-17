import { useCallback, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Message } from './Message';
import { ThinkingMessage } from './ThinkingMessage';
import type { Message as MessageType } from '../../types';
import styles from './Messages.module.css';

interface MessagesProps {
	messages: MessageType[];
	isThinking?: boolean;
	error?: string | null;
	emptyView?: React.ReactNode;
}

export function Messages( {
	messages,
	isThinking,
	error,
	emptyView,
}: MessagesProps ) {
	const scrollAreaRef = useRef< HTMLDivElement >( null );

	const scrollToBottom = useCallback( () => {
		if ( scrollAreaRef.current ) {
			scrollAreaRef.current.scrollTo( {
				top: scrollAreaRef.current.scrollHeight,
				behavior: 'smooth',
			} );
		}
	}, [] );

	useEffect( () => {
		scrollToBottom();
	}, [ messages, isThinking, scrollToBottom ] );

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
