import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useAgentChat } from '../../hooks/useAgentChat';
import { useChat } from '../../hooks/useChat';
import { useInput } from '../../hooks/useInput';
import type { ChatProps } from '../../types';
import { DEFAULT_PLACEHOLDER } from '../../types';
import { cn } from '../../utils/classNames';
import { morphSpring } from '../animations';
import { CollapsedView } from '../views/CollapsedView';
import { CompactView } from '../views/CompactView';
import { ConversationView } from '../views/ConversationView';
import styles from './Chat.module.css';

const STYLE_CONSTANTS = {
	COLLAPSED_SIZE: 56,
	COMPACT_WIDTH: 360,
	EXPANDED_HEIGHT: 520,
	AUTO_COLLAPSE_DELAY: 1500,
	BORDER_RADIUS: 24,
	PADDING: 16,
} as const;

export function Chat( {
	variant = 'floating',
	triggerIcon,
	placeholder = DEFAULT_PLACEHOLDER,
	notice,
	onOpen,
	onExpand,
	onClose,
	emptyView,
	chatState,
}: ChatProps ) {
	// Get real agent state from the store
	const {
		messages,
		isThinking,
		isSendingMessage,
		error,
		sendMessage,
		resetAgentConversation,
	} = useAgentChat();

	const chat = useChat( chatState );
	const timeoutRefs = useRef< Set< NodeJS.Timeout > >( new Set() );
	const input = useInput( {
		onSubmit: async ( message: string ) => {
			if ( chat.state !== 'expanded' ) {
				onExpand?.();
			}
			chat.setState( 'expanded' );
			await sendMessage( message );
		},
		isProcessing: isThinking || isSendingMessage,
	} );

	const [ compactHeight, setCompactHeight ] = useState( 56 );
	const compactRef = useRef< HTMLDivElement >( null );

	// Handle opening the chat and call onOpen callback
	const handleOpen = useCallback( () => {
		chat.open();
		onOpen?.();
	}, [ chat, onOpen ] );

	// Check if should auto-collapse (no input and not focused)
	const shouldAutoCollapse = useCallback( () => {
		return (
			! input.value.trim() &&
			input.textareaRef.current?.ownerDocument?.activeElement?.tagName !==
				'TEXTAREA'
		);
	}, [ input.value, input.textareaRef ] );

	const getHeightForState = ( state: string ) => {
		if ( state === 'collapsed' ) {
			return STYLE_CONSTANTS.COLLAPSED_SIZE;
		}
		if ( state === 'compact' ) {
			return compactHeight;
		}
		return STYLE_CONSTANTS.EXPANDED_HEIGHT;
	};

	// Handle hover to show compact view
	const handleHover = useCallback( () => {
		if ( chat.state === 'collapsed' ) {
			chat.setState( 'compact' );
			const timeoutId = setTimeout( () => {
				if ( chat.state === 'compact' && shouldAutoCollapse() ) {
					chat.setState( 'collapsed' );
				}
				timeoutRefs.current.delete( timeoutId );
			}, STYLE_CONSTANTS.AUTO_COLLAPSE_DELAY );
			timeoutRefs.current.add( timeoutId );
		}
	}, [ chat, shouldAutoCollapse ] );

	// Handle auto-collapse - return to collapsed if no input value and not focused
	const handleAutoCollapse = useCallback( () => {
		if ( chat.state === 'compact' && shouldAutoCollapse() ) {
			const timeoutId = setTimeout( () => {
				if ( chat.state === 'compact' && shouldAutoCollapse() ) {
					chat.setState( 'collapsed' );
				}
				timeoutRefs.current.delete( timeoutId );
			}, STYLE_CONSTANTS.AUTO_COLLAPSE_DELAY );
			timeoutRefs.current.add( timeoutId );
		}
	}, [ chat, shouldAutoCollapse ] );

	// Handle message submission (for button clicks)
	const handleSubmit = useCallback( async () => {
		if ( input.value.trim() ) {
			const message = input.value.trim();
			input.clear();
			if ( chat.state !== 'expanded' ) {
				onExpand?.();
			}
			chat.setState( 'expanded' );
			await sendMessage( message );
		}
	}, [ input, sendMessage, chat, onExpand ] );

	// Handle minimize (go back to compact state)
	const handleMinimize = useCallback( () => {
		chat.setState( 'compact' );
	}, [ chat ] );

	// Handle close (go back to collapsed state)
	const handleClose = useCallback( () => {
		input.clear();
		resetAgentConversation();
		chat.close();

		if ( onClose ) {
			onClose();
		}
	}, [ input, resetAgentConversation, chat, onClose ] );

	// Track previous state for animation purposes
	const prevStateRef = useRef( chat.state );
	const fromExpanded =
		prevStateRef.current === 'expanded' && chat.state === 'collapsed';
	const fromCompact =
		prevStateRef.current === 'compact' && chat.state === 'expanded';

	useEffect( () => {
		prevStateRef.current = chat.state;
	} );

	// Cleanup timeouts on unmount
	useEffect( () => {
		const timeouts = timeoutRefs.current;
		return () => {
			timeouts.forEach( ( timeoutId ) => {
				clearTimeout( timeoutId );
			} );
			timeouts.clear();
		};
	}, [] );

	// Measure the compact view height
	useEffect( () => {
		if ( chat.state === 'compact' && compactRef.current ) {
			const height =
				compactRef.current.scrollHeight + STYLE_CONSTANTS.PADDING;
			setCompactHeight( height );
		}
	}, [ chat.state, input.value ] );

	// Handle embedded variant.
	if ( variant === 'embedded' ) {
		return (
			<div
				data-slot="chat-embedded"
				className={ cn( styles.container, styles.embedded ) }
			>
				<ConversationView
					messages={ messages }
					inputValue={ input.value }
					onInputChange={ input.setValue }
					onSubmit={ handleSubmit }
					onKeyDown={ input.handleKeyDown }
					textareaRef={ input.textareaRef }
					placeholder={ placeholder }
					isProcessing={ isThinking || isSendingMessage }
					showHeader={ false }
					notice={ notice }
					isThinking={ isThinking }
					error={ error }
					emptyView={ emptyView }
				/>
			</div>
		);
	}

	return (
		<div
			data-slot="chat-floating"
			className={ cn( styles.container, styles.floating ) }
			onMouseLeave={ handleAutoCollapse }
		>
			<motion.div
				layout
				className={ styles.content }
				initial={ false }
				animate={ {
					width:
						chat.state === 'collapsed'
							? STYLE_CONSTANTS.COLLAPSED_SIZE
							: STYLE_CONSTANTS.COMPACT_WIDTH,
					height: getHeightForState( chat.state ),
					transition: input.value.trim()
						? { duration: 0 }
						: morphSpring,
				} }
				style={ {
					borderRadius: STYLE_CONSTANTS.BORDER_RADIUS,
				} }
			>
				<AnimatePresence mode="wait">
					{ chat.state === 'collapsed' && (
						<CollapsedView
							key="collapsed"
							icon={ triggerIcon }
							onClick={ handleOpen }
							onHover={ handleHover }
							fromExpanded={ fromExpanded }
						/>
					) }
					{ chat.state === 'compact' && (
						<div ref={ compactRef }>
							<CompactView
								key="compact"
								value={ input.value }
								onChange={ input.setValue }
								onSubmit={ handleSubmit }
								onKeyDown={ input.handleKeyDown }
								textareaRef={ input.textareaRef }
								placeholder={ placeholder }
								isProcessing={ isThinking || isSendingMessage }
								onBlur={ handleAutoCollapse }
							/>
						</div>
					) }
					{ chat.state === 'expanded' && (
						<ConversationView
							key="expanded"
							messages={ messages }
							inputValue={ input.value }
							onInputChange={ input.setValue }
							onSubmit={ handleSubmit }
							onKeyDown={ input.handleKeyDown }
							textareaRef={ input.textareaRef }
							placeholder={ placeholder }
							isProcessing={ isThinking || isSendingMessage }
							showHeader={ true }
							onClose={ handleClose }
							onMinimize={ handleMinimize }
							fromCompact={ fromCompact }
							notice={ notice }
							isThinking={ isThinking }
							error={ error }
							emptyView={ emptyView }
						/>
					) }
				</AnimatePresence>
			</motion.div>
		</div>
	);
}
