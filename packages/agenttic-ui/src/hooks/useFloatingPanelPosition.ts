import { useCallback, useEffect, useRef, useState } from 'react';
import {
	animate,
	type MotionValue,
	type PanInfo,
	useDragControls,
} from 'framer-motion';
import { DRAG_CONSTANTS, STYLE_CONSTANTS } from '../utils/constants';
import { morphSpring } from '../components/animations';
import {
	type ChatPosition,
	getChatPosition,
	getCornerSnapPosition,
	setChatPosition,
} from '../utils/chatStorage';
import type { ChatSize, ChatState } from '../types';

export interface UseFloatingPanelPositionArgs {
	freeDrag: boolean;
	initialChatPosition?: ChatPosition;
	chatState: ChatState;
	onChatPositionChange?: ( position: ChatPosition ) => void;
	onFreeDragEnd?: ( position: { x: number; y: number } ) => void;
	// Shared x/y motion values, seeded and owned by the composition hook so the
	// position and resize concerns agree on one pair.
	x: MotionValue< number >;
	y: MotionValue< number >;
	// Resize-hook accessors, consumed directly (no ref). getLiveWidth returns the
	// OLD width mid-grow while getPanelSize returns the committed NEW width; their
	// difference is the grow delta used to shift the pinned edge.
	getPanelSize: () => ChatSize;
	// Re-clamps the resized size into the current viewport; the window-resize
	// handler calls it first so the position clamp reads the corrected size.
	clampResizedSize: () => void;
	getLiveWidth: () => number;
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
	// Reconciles x/y after a programmatic size change, animating with the morph
	// spring so the pinned edge stays visually fixed as the panel grows. The resize
	// hook calls this from its controlled-size effect (bridged by the composition).
	repositionForResize: () => void;
}

// Owns the drag/snap/free-drag concern: the x/y position motion values, snapped
// side, gesture state, the pointer gate, corner-snap math, and the
// free-drag/minimize position effects. Composes with useResizablePanel via the
// shared x/y values and the size accessors it receives.
export function useFloatingPanelPosition( {
	freeDrag,
	initialChatPosition,
	chatState,
	onChatPositionChange,
	onFreeDragEnd,
	x,
	y,
	getPanelSize,
	clampResizedSize,
	getLiveWidth,
}: UseFloatingPanelPositionArgs ): UseFloatingPanelPositionResult {
	const [ isDragging, setIsDragging ] = useState( false );
	const [ currentSide, setCurrentSide ] = useState< ChatPosition >( () =>
		getChatPosition( initialChatPosition )
	);

	const constraintsRef = useRef< HTMLDivElement >( null );
	const chatRef = useRef< HTMLDivElement >( null );

	const dragControls = useDragControls();

	// Analytic (DOM-free) corner-snap target: the panel is CSS-anchored at
	// left/bottom VIEWPORT_OFFSET, so the docked transform derives from side +
	// width alone. Reading the DOM mid-animation snapshotted a stale height and
	// drifted `y` upward on the first grow click.
	const calculateSnapPosition = useCallback(
		( side?: 'left' | 'right' ) => {
			const targetSide = side ?? currentSide;
			return getCornerSnapPosition( targetSide, getPanelSize().width );
		},
		[ currentSide, getPanelSize ]
	);

	const handlePointerDown = useCallback(
		( event: React.PointerEvent< HTMLDivElement > ) => {
			const target = event.target as HTMLElement;

			// Resize handles run their own pointer loop — never start a move-drag
			// from one, or the two gestures fight. This must come first.
			if ( target.closest( '[data-slot="resize-handle"]' ) ) {
				return;
			}

			const isFromIframe = target.ownerDocument !== document;

			if ( isFromIframe ) {
				return;
			}

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

	const handleDragEnd = useCallback(
		( _event: unknown, info: PanInfo ) => {
			setIsDragging( false );

			// Pick a side from the drop position, accounting for the panel width so
			// the split is a true 50/50.
			const dropX = x.get();
			const chatWidth = getPanelSize().width;
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
			getPanelSize,
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
			getPanelSize().width / 2;
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
		getPanelSize,
	] );

	// In free-drag mode `bottom: 0` already docks the panel bottom on minimize, so
	// the correct `y` offset is 0. Pin `y` to 0 on minimize and restore the dragged
	// offset on un-minimize (stashed in a ref). Never fire onFreeDragEnd here — this
	// internal transition must not corrupt the consumer's persisted position.
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

	// Shared vertical treatment for both grow modes. The box is bottom-anchored, so
	// a height grow extends UPWARD with the bottom pinned: hold `y` (skipY) and only
	// correct the overflow where the grown top crosses the inset (minY). We only
	// ever raise `y` toward minY, so growth can never lift the pinned bottom.
	const holdYWithTopGuard = useCallback(
		( panelHeight: number ): { y: number; skipY: boolean } => {
			const currentY = y.get();
			const minY =
				2 * STYLE_CONSTANTS.VIEWPORT_OFFSET +
				panelHeight -
				window.innerHeight;
			return currentY < minY
				? { y: minY, skipY: false }
				: { y: currentY, skipY: true };
		},
		[ y ]
	);

	// Shared position-reconcile: the on-screen target for the CURRENT size + side.
	// `deltaWidth` is the grow delta (NEW − OLD width); grow paths pass it, the
	// window-resize clamp passes 0 so it never applies a directional shift.
	const computeReconciledPosition = useCallback(
		(
			deltaWidth: number
		): {
			x: number;
			y: number;
			skipY: boolean;
		} => {
			const panelSize = getPanelSize();

			if ( freeDrag ) {
				// Direction-aware horizontal. Right side: shift x left by the grow
				// delta so the CURRENT right edge stays fixed (grows top-left). Left
				// side: no shift, hold the left edge (grows top-right). Both clamp to
				// [0, maxX]; the Math.max(0) floor wins, so pinning the right edge can
				// never push the left edge past the inset (near-left-edge grows right).
				const maxX =
					window.innerWidth -
					panelSize.width -
					2 * STYLE_CONSTANTS.VIEWPORT_OFFSET;
				const sideShift = currentSide === 'right' ? deltaWidth : 0;
				const xClamped = Math.max(
					0,
					Math.min( x.get() - sideShift, maxX )
				);
				const vertical = holdYWithTopGuard( panelSize.height );
				return { x: xClamped, y: vertical.y, skipY: vertical.skipY };
			}

			// Corner-snap: analytic dock x (no DOM read → no stale-height drift).
			const snapX =
				currentSide === 'right'
					? window.innerWidth -
					  panelSize.width -
					  2 * STYLE_CONSTANTS.VIEWPORT_OFFSET
					: 0;

			// While minimized the `y` transform is pinned to 0 and `bottom: 0` keeps
			// the tab docked, so leave y alone — overwriting fights the un-minimize
			// stash restore.
			if ( chatState === 'minimized' ) {
				return { x: snapX, y: 0, skipY: true };
			}

			const vertical = holdYWithTopGuard( panelSize.height );
			return { x: snapX, y: vertical.y, skipY: vertical.skipY };
		},
		[ freeDrag, x, currentSide, chatState, holdYWithTopGuard, getPanelSize ]
	);

	// Reconcile x/y after a programmatic size change, animating with the morph
	// spring so it runs concurrent with the size springs (one motion). No-op
	// mid-drag: the reposition must never fight an active drag gesture.
	const repositionForResize = useCallback( () => {
		if ( isDragging ) {
			return;
		}
		// getPanelSize is the NEW committed width; getLiveWidth is the OLD width the
		// in-flight spring still drives. Their difference is the grow delta.
		const deltaWidth = getPanelSize().width - getLiveWidth();
		const target = computeReconciledPosition( deltaWidth );
		animate( x, target.x, morphSpring );
		if ( ! target.skipY ) {
			animate( y, target.y, morphSpring );
		}
	}, [
		isDragging,
		computeReconciledPosition,
		getPanelSize,
		getLiveWidth,
		x,
		y,
	] );

	// Window resize: clamp the resized SIZE back into the new box first (so the
	// position clamp reads the corrected size), then clamp/snap the POSITION.
	useEffect( () => {
		const handleResize = () => {
			clampResizedSize();

			// Δ=0: a window resize is a re-clamp, not a directional grow — a nonzero
			// Δ would spuriously shift x.
			const target = computeReconciledPosition( 0 );

			x.set( target.x );
			if ( ! target.skipY ) {
				y.set( target.y );
			}
		};

		window.addEventListener( 'resize', handleResize );
		return () => window.removeEventListener( 'resize', handleResize );
	}, [ x, y, clampResizedSize, computeReconciledPosition ] );

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
		repositionForResize,
	};
}
