import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
	animate,
	AnimatePresence,
	motion,
	type PanInfo,
	useDragControls,
	useMotionValue,
} from 'framer-motion';
import { DRAG_CONSTANTS, STYLE_CONSTANTS } from '../utils/constants';
import { loadAgentticTranslations } from '../utils/translation-loader';
import { useChat } from '../hooks/useChat';
import { useInput } from '../hooks/useInput';
import { useWindowFocusStatus } from '../hooks/useWindowFocusStatus';
import type { AgentUIProps, Suggestion } from '../types';
import { cn } from '../utils/classNames';
import {
	type ChatPosition,
	getChatPosition,
	getInitialChatPosition,
	setChatPosition,
} from '../utils/chatStorage';
import { morphSpring } from './animations';
import {
	type AgentUIContextValue,
	AgentUIProvider,
} from '../context/AgentUIContext';
import { CollapsedView } from './views/CollapsedView';
import { CompactView } from './views/CompactView';
import { MinimizedView } from './views/MinimizedView';
import styles from './chat/Chat.module.css';
import { __, sprintf } from '@wordpress/i18n';

interface AgentUIContainerProps extends AgentUIProps {
	children: React.ReactNode;
}

function DragOverlay() {
	return (
		<div
			style={ {
				position: 'fixed',
				top: 0,
				left: 0,
				right: 0,
				bottom: 0,
				zIndex: 9999,
				cursor: 'grabbing',
				pointerEvents: 'auto',
				userSelect: 'none',
				WebkitUserSelect: 'none',
				MozUserSelect: 'none',
				msUserSelect: 'none',
			} }
		/>
	);
}

export function AgentUIContainer( {
	children,
	messages,
	isProcessing,
	error,
	onSubmit,
	variant = 'floating',
	triggerIcon,
	triggerTitle,
	placeholder,
	notice,
	onOpen,
	onExpand,
	onClose,
	onStop,
	emptyView,
	floatingChatState,
	suggestions,
	clearSuggestions,
	onSuggestionClick,
	messageRenderer,
	messagesPosition,
	showAgentIcon,
	className,
	inputValue: controlledInputValue,
	onInputChange: controlledOnInputChange,
	draggableStates = [ 'expanded' ], // Default to only expanded for backward compatibility
	locale = 'en',
	maxInputLength = 600, // Default to 600 characters
	onInputLimitExceeded,
	expandOnClick,
	expandOnHover = true,
	thinkingMessage,
	initialChatPosition,
	onChatPositionChange,
	onTypingStatusChange,
	freeDrag = false,
	initialFreeDragPosition,
	onFreeDragEnd,
}: AgentUIContainerProps ) {
	// Determine if input is controlled or uncontrolled
	const isControlled = controlledInputValue !== undefined;

	// Local input state for uncontrolled mode
	const [ uncontrolledInputValue, setUncontrolledInputValue ] =
		useState( '' );

	// Use controlled value if provided, otherwise use internal state
	const inputValue = isControlled
		? controlledInputValue
		: uncontrolledInputValue;
	const setInputValue = isControlled
		? controlledOnInputChange!
		: setUncontrolledInputValue;

	const chat = useChat( floatingChatState );

	// Track if user clicked to open (vs hovered)
	const wasClickedToOpen = useRef( false );
	const wasClickedToClose = useRef( false );
	const wasClickedToExpand = useRef( false );

	// Track animation state
	const [ isAnimating, setIsAnimating ] = useState( false );

	const [ isDragging, setIsDragging ] = useState( false );

	// Track typing status for callback
	const [ isInputFocused, setIsInputFocused ] = useState( false );
	const isWindowFocused = useWindowFocusStatus();
	const [ lastTypingStatus, setLastTypingStatus ] = useState( false );

	// Load translations when locale changes
	useEffect( () => {
		const translationsLoaded = loadAgentticTranslations( locale, {
			domain: 'a8c-agenttic',
		} );

		if ( ! translationsLoaded ) {
			// eslint-disable-next-line no-console
			console.warn(
				`Translations could not be loaded for locale: ${ locale }, defaulting to English`
			);
		}
	}, [ locale ] );

	// Calculate typing status and trigger callback when it changes
	useEffect( () => {
		const hasText = inputValue.length > 0;
		const isTyping = isInputFocused && isWindowFocused && hasText;

		if ( isTyping !== lastTypingStatus ) {
			setLastTypingStatus( isTyping );
			onTypingStatusChange?.( isTyping );
		}
	}, [
		isInputFocused,
		isWindowFocused,
		inputValue.length,
		lastTypingStatus,
		onTypingStatusChange,
	] );

	// Focus handlers for typing status tracking
	const handleInputFocus = useCallback( () => {
		setIsInputFocused( true );
	}, [] );

	const handleInputBlur = useCallback( () => {
		setIsInputFocused( false );
	}, [] );

	// Calculate if input exceeds limit
	const isInputOverLimit = inputValue.length > maxInputLength;

	// Trigger callback when limit is exceeded
	useEffect( () => {
		if ( isInputOverLimit ) {
			onInputLimitExceeded?.();
		}
	}, [ isInputOverLimit, onInputLimitExceeded ] );

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
		isInputOverLimit,
		floatingChatState: chat.state,
	} );

	const [ compactHeight, setCompactHeight ] = useState( 56 );
	const [ currentSide, setCurrentSide ] = useState< ChatPosition >(
		getChatPosition( initialChatPosition )
	);
	const compactRef = useRef< HTMLDivElement >( null );
	const constraintsRef = useRef< HTMLDivElement >( null );
	const chatRef = useRef< HTMLDivElement >( null );

	// Motion values for programmatic control
	const { x: initialX, y: initialY } = getInitialChatPosition( {
		freeDrag,
		initialFreeDragPosition,
		side: currentSide,
	} );
	const x = useMotionValue( initialX );
	const y = useMotionValue( initialY );
	const dragControls = useDragControls();

	// Handle suggestion submission
	const handleSuggestionSubmit = useCallback(
		async (
			selectedSuggestion: Suggestion,
			availableSuggestions: Suggestion[]
		) => {
			const value = selectedSuggestion.prompt ?? selectedSuggestion.label;

			if ( selectedSuggestion.autoSubmit ) {
				// Auto-submit: send message directly to LLM
				clearSuggestions?.();
				const message = value.trim();
				if ( message ) {
					await onSubmit( message );
				}
			} else {
				// Default: populate input field for user to edit/submit
				const valueWithSpace = value.endsWith( ' ' )
					? value
					: `${ value } `;
				input.setValue( valueWithSpace );
				clearSuggestions?.();
				if ( input.textareaRef.current ) {
					input.textareaRef.current.focus();
					input.textareaRef.current.setSelectionRange(
						valueWithSpace.length,
						valueWithSpace.length
					);
				}
			}

			onSuggestionClick?.( selectedSuggestion, availableSuggestions );
		},
		[ clearSuggestions, onSubmit, onSuggestionClick, input ]
	);

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

	const getHeightForState = useCallback(
		( state: string ) => {
			if ( state === 'collapsed' || state === 'minimized' ) {
				return STYLE_CONSTANTS.COLLAPSED_SIZE;
			}
			if ( state === 'compact' ) {
				return compactHeight;
			}
			return STYLE_CONSTANTS.EXPANDED_HEIGHT;
		},
		[ compactHeight ]
	);

	// Handle hover to show compact view
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
		const message = input.value.trim();
		input.clear();
		if ( chat.state !== 'expanded' ) {
			onExpand?.();
		}
		chat.setState( 'expanded' );
		await onSubmit( message );
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

			// Calculate current height based on chat state
			const currentHeight = getHeightForState( chat.state );

			// Calculate target position
			const targetX =
				targetSide === 'left'
					? constraintBox.left
					: constraintBox.right - STYLE_CONSTANTS.COMPACT_WIDTH;
			// The minimized bar docks to the viewport bottom, so it ignores the inset.
			const targetY =
				chat.state === 'minimized'
					? window.innerHeight - currentHeight
					: constraintBox.bottom - currentHeight;

			return {
				x: targetX - baseX,
				y: targetY - baseY,
			};
		},
		[ currentSide, chat.state, getHeightForState ]
	);

	// Handle pointer down to control drag initiation
	const handlePointerDown = useCallback(
		( event: React.PointerEvent< HTMLDivElement > ) => {
			const target = event.target as HTMLElement;

			// Check if the target element is from an iframe.
			const isFromIframe = target.ownerDocument !== document;

			if ( isFromIframe ) {
				return; // Don't start drag for iframe content clicks.
			}

			// Don't drag if clicking inside non-draggable areas
			const isNonDraggable = target.closest(
				DRAG_CONSTANTS.NON_DRAGGABLE_SELECTORS
			);

			if ( ! isNonDraggable ) {
				// Prevent text selection during drag
				event.preventDefault();
				dragControls.start( event.nativeEvent );
			}
		},
		[ dragControls ]
	);

	const handleDragStart = useCallback( () => {
		setIsDragging( true );
	}, [] );

	// Handle drag end with snap functionality
	const handleDragEnd = useCallback(
		( _event: any, info: PanInfo ) => {
			setIsDragging( false );

			// In free drag mode the panel stays where dropped. dragElastic={ 0 }
			// hard-clamps the drag to the constraint box, so skip the corner-snap
			// and report the dropped pixel position so consumers can persist it.
			if ( freeDrag ) {
				onFreeDragEnd?.( { x: x.get(), y: y.get() } );
				return;
			}

			// Determine which side based on drop position
			// For true 50/50 split, account for the chat widget's width
			const dropX = info.point.x;
			const chatWidth = STYLE_CONSTANTS.COMPACT_WIDTH;
			const viewportMidpointX = ( window.innerWidth - chatWidth ) / 2;
			const isLeft = dropX < viewportMidpointX;
			const newSide = isLeft ? 'left' : 'right';

			if ( currentSide !== newSide ) {
				setCurrentSide( newSide );
				setChatPosition( newSide );
				onChatPositionChange?.( newSide );
			}

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
		[
			x,
			y,
			calculateSnapPosition,
			onChatPositionChange,
			currentSide,
			freeDrag,
			onFreeDragEnd,
		]
	);

	// Snap back to the nearest corner when freeDrag is turned off at runtime.
	// Guard on the true→false transition only so a freeDrag=false mount never snaps.
	const prevFreeDragRef = useRef( freeDrag );
	useEffect( () => {
		const wasFreeDrag = prevFreeDragRef.current;
		prevFreeDragRef.current = freeDrag;

		if ( freeDrag || ! wasFreeDrag ) {
			return;
		}

		// Determine side from the panel's center in viewport coords. x.get() is
		// the transform offset from the panel's CSS left: VIEWPORT_OFFSET origin.
		const panelCenter =
			STYLE_CONSTANTS.VIEWPORT_OFFSET +
			x.get() +
			STYLE_CONSTANTS.COMPACT_WIDTH / 2;
		const newSide = panelCenter < window.innerWidth / 2 ? 'left' : 'right';

		if ( currentSide !== newSide ) {
			setCurrentSide( newSide );
			setChatPosition( newSide );
			onChatPositionChange?.( newSide );
		}

		const position = calculateSnapPosition( newSide );
		if ( ! position ) {
			return;
		}

		animate( x, position.x, DRAG_CONSTANTS.SPRING_CONFIG );
		animate( y, position.y, DRAG_CONSTANTS.SPRING_CONFIG );
	}, [
		freeDrag,
		x,
		y,
		calculateSnapPosition,
		onChatPositionChange,
		currentSide,
	] );

	// In free-drag mode the `bottom: 0` minimize animation already docks the
	// panel's bottom edge to the viewport bottom, so the correct drag `y` offset
	// while minimized is 0 — any residual offset would shift the tab off the edge.
	// Pin `y` to 0 on minimize and restore the dragged offset on un-minimize.
	// Stashed in a ref to avoid re-render churn, and we never fire onFreeDragEnd
	// here — this transition is internal and must not corrupt the consumer's
	// persisted free-drag position.
	const stashedFreeDragYRef = useRef< number | null >( null );
	const prevMinimizedRef = useRef( chat.state === 'minimized' );
	useEffect( () => {
		const wasMinimized = prevMinimizedRef.current;
		const isMinimized = chat.state === 'minimized';
		prevMinimizedRef.current = isMinimized;

		// Corner-snap mode already docks via handleDragEnd → calculateSnapPosition.
		if ( ! freeDrag || isMinimized === wasMinimized ) {
			return;
		}

		if ( isMinimized ) {
			// Stash the dragged offset, then let `bottom: 0` do the docking by
			// zeroing the transform. Pinning to 0 avoids double-counting the
			// in-flight `bottom` and height springs that calculateSnapPosition
			// would otherwise snapshot mid-transition.
			stashedFreeDragYRef.current = y.get();
			const controls = animate( y, 0, DRAG_CONSTANTS.SPRING_CONFIG );
			return () => controls.stop();
		}

		// Restore the dragged offset so un-minimizing returns to the dropped spot.
		if ( stashedFreeDragYRef.current === null ) {
			return;
		}
		const controls = animate(
			y,
			stashedFreeDragYRef.current,
			DRAG_CONSTANTS.SPRING_CONFIG
		);
		stashedFreeDragYRef.current = null;
		return () => controls.stop();
	}, [ chat.state, freeDrag, y ] );

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
		const handleResize = () => {
			const position = calculateSnapPosition();
			if ( ! position ) {
				return;
			}

			// Update motion values directly (no animation during resize)
			x.set( position.x );
			// While minimized the `y` transform is pinned to 0 and `bottom: 0`
			// keeps the tab docked regardless of viewport height, so leave it
			// alone — overwriting it would fight the un-minimize stash restore.
			if ( chat.state !== 'minimized' ) {
				y.set( position.y );
			}
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

	// Show emptyView only if a react element is provided, on floating|embedded variant, with no messages
	const showEmptyView =
		emptyView &&
		[ 'floating', 'embedded' ].includes( variant ) &&
		messages.length === 0 &&
		React.isValidElement( emptyView );

	// Clone the emptyView and inject handleSuggestionSubmit
	const computedEmptyView = showEmptyView
		? React.cloneElement( emptyView, {
				onSuggestionClick: handleSuggestionSubmit,
		  } as any )
		: undefined;

	// Compute notice - prioritize input limit error over user-provided notice
	const computedNotice = isInputOverLimit
		? {
				message: sprintf(
					/* translators: %d: maximum number of characters allowed */
					__(
						'Message is too long. Please keep it under %d characters.',
						'a8c-agenttic'
					),
					maxInputLength
				),
				dismissible: false,
				status: 'error' as const,
		  }
		: notice;

	// Create context value
	const contextValue: AgentUIContextValue = {
		// Core data
		messages,
		isProcessing,
		error,

		// Input state
		inputValue: input.value,
		setInputValue: input.setValue,
		clearInput: input.clear,
		textareaRef: input.textareaRef,
		handleKeyDown: input.handleKeyDown,

		// Actions
		onSubmit,
		handleSubmit,
		onStop,

		// UI state
		variant,
		placeholder,
		emptyView: computedEmptyView,
		messageRenderer,
		messagesPosition,
		showAgentIcon,

		// Floating chat specific
		floatingChatState: chat.state,
		triggerIcon,
		onOpen: handleOpen,
		onExpand: handleExpand,
		onClose: handleClose,

		// Suggestions
		suggestions,
		clearSuggestions,
		handleSuggestionSubmit,

		// Notice
		notice: computedNotice,

		// Thinking message
		thinkingMessage,

		// Internal state for components
		focusOnMount: wasClickedToExpand.current,
		fromCompact,
		showExpandButton: ! input.value.trim(),

		// Input validation
		isInputOverLimit,

		// Focus handlers for typing status
		onInputFocus: handleInputFocus,
		onInputBlur: handleInputBlur,
	};

	// Handle embedded variant.
	if ( variant === 'embedded' ) {
		return (
			<AgentUIProvider value={ contextValue }>
				<div
					data-slot="chat-embedded"
					className={ cn(
						className,
						styles.container,
						styles.embedded
					) }
				>
					{ children }
				</div>
			</AgentUIProvider>
		);
	}

	// Floating variant
	return (
		<AgentUIProvider value={ contextValue }>
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
									onFocus={ handleInputFocus }
									onExpand={ handleExpand }
									showExpandButton={ ! input.value.trim() }
									focusOnMount={ wasClickedToOpen.current }
									onStop={ onStop }
									suggestions={ suggestions }
									clearSuggestions={ clearSuggestions }
									handleSuggestionSubmit={
										handleSuggestionSubmit
									}
									expandOnClick={ expandOnClick }
								/>
							</div>
						) }
						{ chat.state === 'expanded' && children }
					</AnimatePresence>
				</motion.div>
			</motion.div>
		</AgentUIProvider>
	);
}
