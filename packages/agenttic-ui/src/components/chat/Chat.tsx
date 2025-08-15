import {
	animate,
	AnimatePresence,
	motion,
	type PanInfo,
	useDragControls,
	useMotionValue,
} from 'framer-motion';
import { useCallback, useEffect, useRef, useState } from 'react';
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
	COMPACT_WIDTH: 372,
	EXPANDED_HEIGHT: 520,
	AUTO_COLLAPSE_DELAY: 1500,
	BORDER_RADIUS: 24,
	PADDING: 16,
	VIEWPORT_OFFSET: 16,
} as const;

const DRAG_CONSTANTS = {
	SPRING_CONFIG: {
		type: 'spring' as const,
		damping: 25,
		stiffness: 300,
	},
	VELOCITY_MULTIPLIER: 0.1,
	NON_DRAGGABLE_SELECTORS: [
		'[data-slot="message"]',
		'[data-slot="chat-input"]',
		'[data-slot="input-container"]',
	].join( ', ' ),
} as const;

export function Chat( {
	messages,
	isProcessing,
	error,
	onSubmit,
	variant = 'floating',
	triggerIcon,
	placeholder = DEFAULT_PLACEHOLDER,
	notice,
	onOpen,
	onExpand,
	onClose,
	emptyView,
	floatingChatState,
	suggestions,
	clearSuggestions,
	messageRenderer,
	className,
}: ChatProps ) {
	// Local input state for controlled component pattern
	const [ inputValue, setInputValue ] = useState( '' );

	const chat = useChat( floatingChatState );

	// Track if user clicked to open (vs hovered)
	const wasClickedToOpen = useRef( false );
	const wasClickedToClose = useRef( false );
	useEffect( () => {
		// Reset flags when chat state changes.
		wasClickedToOpen.current = false;
		wasClickedToClose.current = false;
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
	} );

	const [ compactHeight, setCompactHeight ] = useState( 56 );
	const [ currentSide, setCurrentSide ] = useState< 'left' | 'right' >(
		'left'
	);
	const compactRef = useRef< HTMLDivElement >( null );
	const constraintsRef = useRef< HTMLDivElement >( null );
	const chatRef = useRef< HTMLDivElement >( null );

	// Motion values for programmatic control
	const x = useMotionValue( 0 );
	const y = useMotionValue( 0 );
	const dragControls = useDragControls();

	// Handle opening the chat and call onOpen callback
	const handleOpen = useCallback( () => {
		wasClickedToOpen.current = true;
		chat.open();
		onOpen?.();
	}, [ chat, onOpen ] );

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
			await onSubmit( message );
		}
	}, [ input, onSubmit, chat, onExpand ] );

	// Handle expand (go to expanded state)
	const handleExpand = useCallback( () => {
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

	// Calculate snap position based on current side
	const calculateSnapPosition = useCallback(
		( side?: 'left' | 'right' ) => {
			if ( ! chatRef.current || ! constraintsRef.current ) {
				return null;
			}

			const elementBox = chatRef.current.getBoundingClientRect();
			const constraintBox =
				constraintsRef.current.getBoundingClientRect();

			// Calculate base position (without transforms)
			const style = window.getComputedStyle( chatRef.current );
			const transformMatrix = new DOMMatrixReadOnly( style.transform );
			const baseX = elementBox.x - transformMatrix.e;
			const baseY = elementBox.y - transformMatrix.f;

			// Use provided side or fall back to current side
			const targetSide = side ?? currentSide;

			// Calculate target position
			const targetX =
				targetSide === 'left'
					? constraintBox.left
					: constraintBox.right - STYLE_CONSTANTS.COMPACT_WIDTH;
			const targetY =
				constraintBox.bottom - STYLE_CONSTANTS.EXPANDED_HEIGHT;

			return {
				x: targetX - baseX,
				y: targetY - baseY,
			};
		},
		[ currentSide ]
	);

	// Handle pointer down to control drag initiation
	const handlePointerDown = useCallback(
		( event: React.PointerEvent< HTMLDivElement > ) => {
			const target = event.target as HTMLElement;

			// Don't drag if clicking inside non-draggable areas
			const isNonDraggable = target.closest(
				DRAG_CONSTANTS.NON_DRAGGABLE_SELECTORS
			);

			if ( ! isNonDraggable ) {
				dragControls.start( event.nativeEvent );
			}
		},
		[ dragControls ]
	);

	// Handle drag end with snap functionality
	const handleDragEnd = useCallback(
		( _event: any, info: PanInfo ) => {
			// Determine which side based on drop position
			// For true 50/50 split, account for the chat widget's width
			const dropX = info.point.x;
			const chatWidth = STYLE_CONSTANTS.COMPACT_WIDTH;
			const viewportMidpointX = ( window.innerWidth - chatWidth ) / 2;
			const isLeft = dropX < viewportMidpointX;
			const newSide = isLeft ? 'left' : 'right';
			setCurrentSide( newSide );

			// Calculate snap position using the new side immediately
			const position = calculateSnapPosition( newSide );
			if ( ! position ) {
				return;
			}

			// Animate to snap position using motion values
			animate( x, position.x, {
				...DRAG_CONSTANTS.SPRING_CONFIG,
				velocity: info.velocity.x * DRAG_CONSTANTS.VELOCITY_MULTIPLIER,
			} );
			animate( y, position.y, {
				...DRAG_CONSTANTS.SPRING_CONFIG,
				velocity: info.velocity.y * DRAG_CONSTANTS.VELOCITY_MULTIPLIER,
			} );
		},
		[ x, y, calculateSnapPosition ]
	);

	// Track previous state for animation purposes
	const prevStateRef = useRef( chat.state );
	const fromCompact =
		prevStateRef.current === 'compact' && chat.state === 'expanded';

	useEffect( () => {
		// Clear all timeouts when state changes (they're no longer valid)
		clearAllTimeouts();
		prevStateRef.current = chat.state;
	}, [ chat.state, clearAllTimeouts ] );

	// Handle window resize to maintain bottom positioning
	useEffect( () => {
		if ( chat.state !== 'expanded' ) {
			return;
		}

		const handleResize = () => {
			const position = calculateSnapPosition();
			if ( ! position ) {
				return;
			}

			// Update motion values directly (no animation during resize)
			x.set( position.x );
			y.set( position.y );
		};

		window.addEventListener( 'resize', handleResize );
		return () => window.removeEventListener( 'resize', handleResize );
	}, [ chat.state, x, y, calculateSnapPosition ] );

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
					showHeader={ false }
					notice={ notice }
					suggestions={ suggestions }
					clearSuggestions={ clearSuggestions }
					error={ error }
					emptyView={ emptyView }
					messageRenderer={ messageRenderer }
					onExpand={ handleExpand }
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
			<motion.div
				ref={ chatRef }
				data-slot="chat-floating"
				className={ cn( className, styles.container, styles.floating ) }
				onMouseLeave={
					chat.state === 'compact' ? handleAutoCollapse : undefined
				}
				drag={ chat.state === 'expanded' }
				dragControls={ dragControls }
				dragListener={ false }
				dragConstraints={ constraintsRef }
				dragMomentum={ false }
				dragElastic={ 0.1 }
				dragTransition={ { power: 0.1, timeConstant: 100 } }
				onDragEnd={ handleDragEnd }
				onPointerDown={ handlePointerDown }
				style={ {
					x,
					y,
					bottom: STYLE_CONSTANTS.VIEWPORT_OFFSET,
					left: STYLE_CONSTANTS.VIEWPORT_OFFSET,
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
								showHeader={ true }
								onClose={ handleClose }
								fromCompact={ fromCompact }
								notice={ notice }
								suggestions={ suggestions }
								clearSuggestions={ clearSuggestions }
								error={ error }
								emptyView={ emptyView }
								messageRenderer={ messageRenderer }
								onExpand={ handleExpand }
							/>
						) }
					</AnimatePresence>
				</motion.div>
			</motion.div>
		</>
	);
}
