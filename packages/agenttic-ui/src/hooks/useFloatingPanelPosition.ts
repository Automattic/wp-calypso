import { useCallback, useEffect, useRef, useState } from 'react';
import {
	animate,
	type MotionValue,
	type PanInfo,
	useDragControls,
	useMotionValue,
} from 'framer-motion';
import { DRAG_CONSTANTS, STYLE_CONSTANTS } from '../utils/constants';
import {
	type ChatPosition,
	clampFreeDragPosition,
	getChatPosition,
	getCornerSnapPosition,
	getInitialChatPosition,
	setChatPosition,
} from '../utils/chatStorage';
import type { ChatState } from '../types';

export interface UseFloatingPanelPositionArgs {
	freeDrag: boolean;
	initialFreeDragPosition: { x: number; y: number } | undefined;
	initialChatPosition?: ChatPosition;
	chatState: ChatState;
	defaultSize?: { width: number; height: number };
	onChatPositionChange?: ( position: ChatPosition ) => void;
	onFreeDragEnd?: ( position: { x: number; y: number } ) => void;
}

export interface UseFloatingPanelPositionResult {
	x: MotionValue< number >;
	y: MotionValue< number >;
	currentSide: ChatPosition;
	isDragging: boolean;
	dragControls: ReturnType< typeof useDragControls >;
	chatRef: React.RefObject< HTMLDivElement >;
	constraintsRef: React.RefObject< HTMLDivElement >;
	handlePointerDown: ( event: React.PointerEvent< HTMLDivElement > ) => void;
	handleDragStart: () => void;
	handleDragEnd: ( event: unknown, info: PanInfo ) => void;
	calculateSnapPosition: ( side?: 'left' | 'right' ) => {
		x: number;
		y: number;
	};
}

// Owns the drag/snap/free-drag concern of the floating panel: the x/y position
// motion values, the snapped-corner side, the active-gesture state, the pointer
// gate, the corner-snap math, and the free-drag/minimize position effects.
export function useFloatingPanelPosition( {
	freeDrag,
	initialFreeDragPosition,
	initialChatPosition,
	chatState,
	defaultSize,
	onChatPositionChange,
	onFreeDragEnd,
}: UseFloatingPanelPositionArgs ): UseFloatingPanelPositionResult {
	const [ isDragging, setIsDragging ] = useState( false );
	const [ currentSide, setCurrentSide ] = useState< ChatPosition >( () =>
		getChatPosition( initialChatPosition )
	);

	const constraintsRef = useRef< HTMLDivElement >( null );
	const chatRef = useRef< HTMLDivElement >( null );

	// Motion values for programmatic control.
	const { x: initialX, y: initialY } = getInitialChatPosition( {
		freeDrag,
		initialFreeDragPosition,
		side: currentSide,
	} );
	const x = useMotionValue( initialX );
	const y = useMotionValue( initialY );
	const dragControls = useDragControls();

	// Analytic corner-snap transform target. DOM-free: the panel is CSS-anchored
	// at left/bottom VIEWPORT_OFFSET, so the docked transform is derivable from the
	// current side + width alone ({ cornerX, 0 }). The minimized case is handled by
	// the caller, not here.
	const calculateSnapPosition = useCallback(
		( side?: 'left' | 'right' ) => {
			const targetSide = side ?? currentSide;
			return getCornerSnapPosition(
				targetSide,
				defaultSize?.width ?? STYLE_CONSTANTS.COMPACT_WIDTH
			);
		},
		[ currentSide, defaultSize?.width ]
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
		( _event: unknown, info: PanInfo ) => {
			setIsDragging( false );

			// Determine which side based on drop position
			// For true 50/50 split, account for the chat widget's width
			const dropX = x.get();
			const chatWidth = STYLE_CONSTANTS.COMPACT_WIDTH;
			const viewportMidpointX = ( window.innerWidth - chatWidth ) / 2;
			const isLeft = dropX < viewportMidpointX;
			const newSide = isLeft ? 'left' : 'right';

			if ( currentSide !== newSide ) {
				setCurrentSide( newSide );
				setChatPosition( newSide );
				onChatPositionChange?.( newSide );
			}

			// In free drag mode the panel stays where dropped. dragElastic={ 0 }
			// hard-clamps the drag to the constraint box, so skip the corner-snap
			// and report the dropped pixel position so consumers can persist it.
			if ( freeDrag ) {
				onFreeDragEnd?.( { x: x.get(), y: y.get() } );
				return;
			}

			// Calculate snap position using the new side immediately
			const position = calculateSnapPosition( newSide );

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
	const prevMinimizedRef = useRef( chatState === 'minimized' );
	useEffect( () => {
		const wasMinimized = prevMinimizedRef.current;
		const isMinimized = chatState === 'minimized';
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
	}, [ chatState, freeDrag, y ] );

	// Handle window resize to maintain bottom positioning.
	useEffect( () => {
		const handleResize = () => {
			// In free-drag mode the panel keeps its dragged position; just clamp
			// it back on-screen if the resize would push it off — no corner-snap.
			if ( freeDrag ) {
				const clamped = clampFreeDragPosition(
					{ x: x.get(), y: y.get() },
					STYLE_CONSTANTS.COMPACT_WIDTH,
					STYLE_CONSTANTS.EXPANDED_HEIGHT
				);
				x.set( clamped.x );
				y.set( clamped.y );
				return;
			}

			const position = calculateSnapPosition();

			// Update motion values directly (no animation during window resize).
			x.set( position.x );
			// While minimized the `y` transform is pinned to 0 and `bottom: 0`
			// keeps the tab docked regardless of viewport height, so leave it
			// alone — overwriting it would fight the un-minimize stash restore.
			if ( chatState !== 'minimized' ) {
				y.set( position.y );
			}
		};

		window.addEventListener( 'resize', handleResize );
		return () => window.removeEventListener( 'resize', handleResize );
	}, [ chatState, x, y, calculateSnapPosition, freeDrag ] );

	return {
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
		calculateSnapPosition,
	};
}
