import { AnimatePresence, motion } from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
import { __ } from '@wordpress/i18n';
import { useChat } from '../../hooks/useChat';
import { useInput } from '../../hooks/useInput';
import { useFloatingPanelDrag } from '../../hooks/useFloatingPanelDrag';
import type { ChatProps } from '../../types';
import { cn } from '../../utils/classNames';
import { STYLE_CONSTANTS } from '../../utils/constants';
import { morphSpring } from '../animations';
import { DragOverlay } from '../DragOverlay';
import { CollapsedView } from '../views/CollapsedView';
import { CompactView } from '../views/CompactView';
import { ConversationView } from '../views/ConversationView';
import { MinimizedView } from '../views/MinimizedView';
import styles from './Chat.module.css';

export function Chat( {
	messages,
	isProcessing,
	error,
	onSubmit,
	variant = 'floating',
	triggerIcon,
	triggerTitle,
	placeholder = __( 'Ask anything', 'a8c-agenttic' ),
	notice,
	onOpen,
	onExpand,
	onClose,
	onStop,
	emptyView,
	floatingChatState,
	suggestions,
	clearSuggestions,
	messageRenderer,
	showAgentIcon,
	className,
	expandOnHover = true,
	draggableStates = [ 'expanded' ], // Default to only expanded for backward compatibility
	freeDrag = false,
	initialFreeDragPosition,
	onFreeDragEnd,
	initialChatPosition,
	onChatPositionChange,
}: ChatProps ) {
	// Local input state for controlled component pattern
	const [ inputValue, setInputValue ] = useState( '' );

	const chat = useChat( floatingChatState );

	// Track if user clicked to open (vs hovered)
	const wasClickedToOpen = useRef( false );
	const wasClickedToClose = useRef( false );
	const wasClickedToExpand = useRef( false );

	// Track animation state
	const [ isAnimating, setIsAnimating ] = useState( false );
	useEffect( () => {
		// Reset flags when chat state changes.
		wasClickedToOpen.current = false;
		wasClickedToClose.current = false;
		wasClickedToExpand.current = false;
	}, [ chat.state ] );

	const timeoutRefs = useRef< Set< NodeJS.Timeout > >( new Set() );

	// Clear all timeouts
	const clearAllTimeouts = useCallback( () => {
		timeoutRefs.current.forEach( ( timeoutId ) => {
			clearTimeout( timeoutId );
		} );
		timeoutRefs.current.clear();
	}, [] );
	const input = useInput( {
		value: inputValue,
		setValue: setInputValue,
		onSubmit: async ( message: string ) => {
			if ( chat.state !== 'expanded' ) {
				onExpand?.();
			}
			chat.setState( 'expanded' );
			await onSubmit( message );
		},
		isProcessing,
		floatingChatState: chat.state,
	} );

	const compactRef = useRef< HTMLDivElement >( null );
	const [ compactHeight, setCompactHeight ] = useState( 56 );

	const {
		x,
		y,
		currentSide,
		isDragging,
		dragControls,
		chatRef,
		constraintsRef,
		handlePointerDown,
		handleDragStart,
		handleDragEnd,
	} = useFloatingPanelDrag( {
		freeDrag,
		initialFreeDragPosition,
		initialChatPosition,
		chatState: chat.state,
		onChatPositionChange,
		onFreeDragEnd,
	} );

	const getHeightForState = ( state: string ) => {
		if ( state === 'collapsed' || state === 'minimized' ) {
			return STYLE_CONSTANTS.COLLAPSED_SIZE;
		}
		if ( state === 'compact' ) {
			return compactHeight;
		}
		return STYLE_CONSTANTS.EXPANDED_HEIGHT;
	};

	// Handle opening the chat and call onOpen callback
	const handleOpen = useCallback( () => {
		wasClickedToOpen.current = true;
		chat.open();
		onOpen?.();
		onExpand?.();
	}, [ chat, onOpen, onExpand ] );

	// Check if should auto-collapse (no input and not focused)
	const shouldAutoCollapse = useCallback( () => {
		const activeElement = chatRef.current?.ownerDocument?.activeElement;

		// If focus is within the chat area, don't auto-collapse
		if ( activeElement && chatRef.current?.contains( activeElement ) ) {
			return false;
		}

		// Don't auto-collapse if there's input text
		if ( inputValue.trim() ) {
			return false;
		}

		return true;
	}, [ inputValue, chatRef ] );

	const handleHover = useCallback( () => {
		if ( ! expandOnHover ) {
			return;
		}

		if ( chat.state === 'collapsed' ) {
			chat.setState( 'compact' );
			// Only auto-collapse if initial state was collapsed
			if ( chat.initialState === 'collapsed' ) {
				const timeoutId = setTimeout( () => {
					if ( chat.state === 'compact' && shouldAutoCollapse() ) {
						chat.setState( 'collapsed' );
					}
					timeoutRefs.current.delete( timeoutId );
				}, STYLE_CONSTANTS.AUTO_COLLAPSE_DELAY );
				timeoutRefs.current.add( timeoutId );
			}
		}
	}, [ chat, shouldAutoCollapse, expandOnHover ] );

	// Handle auto-collapse - return to initial state if no input value and not focused
	const handleAutoCollapse = useCallback( () => {
		// Only auto-collapse if initial state was collapsed
		if (
			chat.initialState === 'collapsed' &&
			chat.state === 'compact' &&
			shouldAutoCollapse()
		) {
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
			await onSubmit( message );
		}
	}, [ input, onSubmit, chat, onExpand ] );

	// Handle expand (go to expanded state)
	const handleExpand = useCallback( () => {
		wasClickedToExpand.current = true;
		onExpand?.();
		chat.setState( 'expanded' );
	}, [ onExpand, chat ] );

	// Handle close (go back to collapsed state)
	const handleClose = useCallback( () => {
		wasClickedToClose.current = true;
		input.clear();
		chat.close();
		if ( onClose ) {
			onClose();
		}
	}, [ input, chat, onClose ] );

	// Track previous state for animation purposes
	const prevStateRef = useRef( chat.state );
	const fromCompact =
		prevStateRef.current === 'compact' && chat.state === 'expanded';

	useEffect( () => {
		// Clear all timeouts when state changes (they're no longer valid)
		clearAllTimeouts();
		prevStateRef.current = chat.state;
	}, [ chat.state, clearAllTimeouts ] );

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
			const measured =
				compactRef.current.scrollHeight + STYLE_CONSTANTS.PADDING;
			setCompactHeight( measured );
		}
	}, [ chat.state, input.value ] );

	// Handle embedded variant.
	if ( variant === 'embedded' ) {
		return (
			<div
				data-slot="chat-embedded"
				className={ cn( className, styles.container, styles.embedded ) }
			>
				<ConversationView
					messages={ messages }
					inputValue={ input.value }
					onInputChange={ input.setValue }
					onSubmit={ handleSubmit }
					onKeyDown={ input.handleKeyDown }
					textareaRef={ input.textareaRef }
					placeholder={ placeholder }
					isProcessing={ isProcessing }
					onStop={ onStop }
					showHeader={ false }
					notice={ notice }
					suggestions={ suggestions }
					clearSuggestions={ clearSuggestions }
					error={ error }
					emptyView={ emptyView }
					messageRenderer={ messageRenderer }
					showAgentIcon={ showAgentIcon }
					onExpand={ handleExpand }
					focusOnMount={ wasClickedToExpand.current }
				/>
			</div>
		);
	}

	return (
		<>
			<div
				ref={ constraintsRef }
				style={ {
					position: 'fixed',
					top: STYLE_CONSTANTS.VIEWPORT_OFFSET,
					left: STYLE_CONSTANTS.VIEWPORT_OFFSET,
					right: STYLE_CONSTANTS.VIEWPORT_OFFSET,
					bottom: STYLE_CONSTANTS.VIEWPORT_OFFSET,
					pointerEvents: 'none',
				} }
			/>

			{ isDragging && <DragOverlay /> }

			<motion.div
				ref={ chatRef }
				data-slot="chat-floating"
				className={ cn( className, styles.container, styles.floating, {
					[ styles.expanded ]: chat.state === 'expanded',
					animating: isAnimating,
				} ) }
				onMouseLeave={
					chat.state === 'compact' ? handleAutoCollapse : undefined
				}
				drag={ draggableStates.includes( chat.state ) }
				dragControls={ dragControls }
				dragListener={ false }
				dragConstraints={ isDragging ? constraintsRef : false }
				dragMomentum={ false }
				dragElastic={ freeDrag ? 0 : 0.1 }
				dragTransition={ { power: 0.1, timeConstant: 100 } }
				onDragStart={ handleDragStart }
				onDragEnd={ handleDragEnd }
				onPointerDown={ handlePointerDown }
				// Glide the dock offset between states; `initial={ false }` skips it on mount.
				initial={ false }
				animate={ {
					bottom:
						chat.state === 'minimized'
							? 0
							: STYLE_CONSTANTS.VIEWPORT_OFFSET,
				} }
				transition={ morphSpring }
				style={ {
					x,
					y,
					left: STYLE_CONSTANTS.VIEWPORT_OFFSET,
					cursor: draggableStates.includes( chat.state )
						? 'grab'
						: 'default',
				} }
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
						x:
							chat.state === 'collapsed' &&
							currentSide === 'right'
								? STYLE_CONSTANTS.COMPACT_WIDTH -
								  STYLE_CONSTANTS.COLLAPSED_SIZE
								: 0,
						borderBottomLeftRadius:
							chat.state === 'minimized'
								? 0
								: STYLE_CONSTANTS.BORDER_RADIUS,
						borderBottomRightRadius:
							chat.state === 'minimized'
								? 0
								: STYLE_CONSTANTS.BORDER_RADIUS,
						transition: input.value.trim()
							? { duration: 0 }
							: morphSpring,
					} }
					onAnimationStart={ () => setIsAnimating( true ) }
					onAnimationComplete={ () => setIsAnimating( false ) }
					style={ {
						borderTopLeftRadius: STYLE_CONSTANTS.BORDER_RADIUS,
						borderTopRightRadius: STYLE_CONSTANTS.BORDER_RADIUS,
					} }
				>
					<AnimatePresence mode="wait">
						{ chat.state === 'collapsed' && (
							<CollapsedView
								key="collapsed"
								icon={ triggerIcon }
								onClick={ handleOpen }
								onHover={ handleHover }
								focusOnMount={ wasClickedToClose.current }
							/>
						) }
						{ chat.state === 'minimized' && (
							<MinimizedView
								key="minimized"
								icon={ triggerIcon }
								title={ triggerTitle }
								onClick={ handleOpen }
								focusOnMount={ wasClickedToClose.current }
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
									isProcessing={ isProcessing }
									onBlur={ handleAutoCollapse }
									onExpand={ handleExpand }
									showExpandButton={ ! input.value.trim() }
									focusOnMount={ wasClickedToOpen.current }
									onStop={ onStop }
									suggestions={ suggestions }
									clearSuggestions={ clearSuggestions }
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
								isProcessing={ isProcessing }
								onStop={ onStop }
								showHeader={ true }
								onClose={ handleClose }
								fromCompact={ fromCompact }
								notice={ notice }
								suggestions={ suggestions }
								clearSuggestions={ clearSuggestions }
								error={ error }
								emptyView={ emptyView }
								messageRenderer={ messageRenderer }
								showAgentIcon={ showAgentIcon }
								onExpand={ handleExpand }
								focusOnMount={ wasClickedToExpand.current }
							/>
						) }
					</AnimatePresence>
				</motion.div>
			</motion.div>
		</>
	);
}
