import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
} from 'react';

import { animate, type MotionValue, useMotionValue } from 'framer-motion';
import { STYLE_CONSTANTS } from '../utils/constants';
import { morphSpring } from '../components/animations';
import type { ChatSize } from '../types';

export interface UseResizablePanelArgs {
	resizable?: boolean | 'horizontal' | 'vertical';
	defaultSize?: ChatSize;
	size?: ChatSize;
	minSize?: Partial< ChatSize >;
	maxSize?: Partial< ChatSize >;
	chatState: string;
	compactHeight: number;
	// x/y are owned by the drag hook; the resize loop shifts them to keep the
	// opposite edge pinned. The composition hook passes them into both hooks.
	x: MotionValue< number >;
	y: MotionValue< number >;
	// Drag-hook position reconcile, run after a programmatic size change so the
	// panel re-clamps/re-snaps. The caller passes the frame-width delta (NEW −
	// OLD) so a right-side panel keeps its pinned edge. Bridged in by the
	// composition hook.
	repositionForResize: ( deltaWidth: number ) => void;
	onResize?: ( size: ChatSize ) => void;
	onResizeEnd?: ( size: ChatSize ) => void;
}

export interface UseResizablePanelResult {
	width: MotionValue< number >;
	height: MotionValue< number >;
	isResizing: boolean;
	expandedSizeRef: React.MutableRefObject< ChatSize >;
	getPanelSize: () => ChatSize;
	clampSize: ( size: ChatSize ) => ChatSize;
	// Clamps the committed expanded size back into the current viewport, writing
	// the corrected size to the motion values + ref. The drag hook's window-resize
	// handler calls this before re-clamping position.
	clampToViewport: () => void;
	getHeightForState: ( state: string ) => number;
	handleResizePointerDown: (
		event: React.PointerEvent< HTMLDivElement >
	) => void;
}

// Owns the resize concern: the live width/height motion values, gesture state,
// clamp/geometry helpers, the pointer loop, and the collapse/expand size morph.
// Composes with the drag hook via the shared x/y motion values passed in.
export function useResizablePanel( {
	resizable = false,
	defaultSize,
	size,
	minSize,
	maxSize,
	chatState,
	compactHeight,
	x,
	y,
	repositionForResize,
	onResize,
	onResizeEnd,
}: UseResizablePanelArgs ): UseResizablePanelResult {
	// Resize size floor, defaulting to today's size so an unsupplied min can never
	// shrink the panel below its historical footprint.
	const minWidth = minSize?.width ?? STYLE_CONSTANTS.COMPACT_WIDTH;
	const minHeight = minSize?.height ?? STYLE_CONSTANTS.EXPANDED_HEIGHT;

	// Live expanded size, seeded from defaultSize.
	const width = useMotionValue(
		defaultSize?.width ?? STYLE_CONSTANTS.COMPACT_WIDTH
	);
	const height = useMotionValue(
		defaultSize?.height ?? STYLE_CONSTANTS.EXPANDED_HEIGHT
	);

	// Last committed expanded size. Survives collapse/minimize (which morph the
	// motion values to a fixed footprint) so re-expanding restores the resized size.
	const expandedSizeRef = useRef< ChatSize >( {
		width: defaultSize?.width ?? STYLE_CONSTANTS.COMPACT_WIDTH,
		height: defaultSize?.height ?? STYLE_CONSTANTS.EXPANDED_HEIGHT,
	} );

	const resizingRef = useRef< {
		edge: string;
		startX: number;
		startY: number;
		startWidth: number;
		startHeight: number;
		startPosX: number;
		startPosY: number;
	} | null >( null );

	// Mid-gesture flag: the inner content `layout` stays off until pointer-up
	// (layout fights the manual width/height writes).
	const [ isResizing, setIsResizing ] = useState( false );

	// Geometry of the constraint box the panel is clamped to.
	const getConstraintBox = useCallback(
		() => ( {
			width: window.innerWidth - STYLE_CONSTANTS.VIEWPORT_OFFSET * 2,
			height: window.innerHeight - STYLE_CONSTANTS.VIEWPORT_OFFSET * 2,
		} ),
		[]
	);

	// Clamp a candidate size into [min, ceiling]. Min wins over max so a viewport
	// smaller than the floor never inverts the bounds.
	const clampSize = useCallback(
		( candidate: ChatSize ): ChatSize => {
			const box = getConstraintBox();
			const maxW = Math.min( maxSize?.width ?? box.width, box.width );
			const maxH = Math.min( maxSize?.height ?? box.height, box.height );
			return {
				width: Math.max( minWidth, Math.min( candidate.width, maxW ) ),
				height: Math.max(
					minHeight,
					Math.min( candidate.height, maxH )
				),
			};
		},
		[
			getConstraintBox,
			maxSize?.width,
			maxSize?.height,
			minWidth,
			minHeight,
		]
	);

	const getHeightForState = useCallback(
		( state: string ) => {
			if ( state === 'collapsed' || state === 'minimized' ) {
				return STYLE_CONSTANTS.COLLAPSED_SIZE;
			}
			if ( state === 'compact' ) {
				return compactHeight;
			}
			// Expanded: honor the last resized height only when resize is enabled.
			return resizable
				? expandedSizeRef.current.height
				: STYLE_CONSTANTS.EXPANDED_HEIGHT;
		},
		[ compactHeight, resizable ]
	);

	// Live panel footprint. Width is the frame the x-math positions (the resized
	// width only while expanded; other states keep the fixed COMPACT_WIDTH frame
	// and the content div compensates inside it). Height is the REAL per-state
	// height — feeding the expanded height to the position clamps while collapsed
	// pushed the small launcher off-screen on short windows.
	const getPanelSize = useCallback(
		(): ChatSize => ( {
			width:
				resizable && chatState === 'expanded'
					? expandedSizeRef.current.width
					: STYLE_CONSTANTS.COMPACT_WIDTH,
			height: getHeightForState( chatState ),
		} ),
		[ resizable, chatState, getHeightForState ]
	);

	// Re-clamp the committed expanded size into the current viewport (window
	// resize). Only expanded owns a resized size; other states are fixed footprint.
	const clampToViewport = useCallback( (): void => {
		if ( resizable && chatState === 'expanded' ) {
			const clamped = clampSize( expandedSizeRef.current );
			width.set( clamped.width );
			height.set( clamped.height );
			expandedSizeRef.current = clamped;
		}
	}, [ resizable, chatState, clampSize, width, height ] );

	// The pointer loop attaches its listeners once per gesture, so anything they
	// close over is frozen at pointerdown. Read the render-dependent pieces
	// (consumer callbacks, clamp bounds) through refs so a mid-gesture re-render —
	// e.g. a controlled parent updating onResize/maxSize per move — is honored.
	const onResizeRef = useRef( onResize );
	const onResizeEndRef = useRef( onResizeEnd );
	const clampSizeRef = useRef( clampSize );
	useLayoutEffect( () => {
		onResizeRef.current = onResize;
		onResizeEndRef.current = onResizeEnd;
		clampSizeRef.current = clampSize;
	} );

	// Resize runs its own pointer loop (not a Framer drag): compute the delta from
	// the grab point per active edge, clamp, and write straight to the motion values.
	const handleResizePointerMove = useCallback(
		( event: PointerEvent ) => {
			const resize = resizingRef.current;
			if ( ! resize ) {
				return;
			}

			const dx = event.clientX - resize.startX;
			const dy = event.clientY - resize.startY;
			const { edge } = resize;

			let nextWidth = resize.startWidth;
			let nextHeight = resize.startHeight;

			if ( edge.includes( 'right' ) ) {
				nextWidth = resize.startWidth + dx;
			} else if ( edge.includes( 'left' ) ) {
				nextWidth = resize.startWidth - dx;
			}

			if ( edge.includes( 'bottom' ) ) {
				nextHeight = resize.startHeight + dy;
			} else if ( edge.includes( 'top' ) ) {
				nextHeight = resize.startHeight - dy;
			}

			const clamped = clampSizeRef.current( {
				width: nextWidth,
				height: nextHeight,
			} );

			// Box is bottom-anchored (CSS `bottom`): left-edge drags shift x to pin
			// the right edge; bottom-edge drags shift y to pin the top edge; top-edge
			// drags leave y alone (CSS `bottom` already pins the bottom).
			if ( edge.includes( 'left' ) ) {
				x.set(
					resize.startPosX + ( resize.startWidth - clamped.width )
				);
			}
			if ( edge.includes( 'bottom' ) ) {
				y.set(
					resize.startPosY + ( clamped.height - resize.startHeight )
				);
			}

			width.set( clamped.width );
			height.set( clamped.height );
			expandedSizeRef.current = clamped;
			onResizeRef.current?.( clamped );
		},
		[ x, y, width, height ]
	);

	const handleResizePointerUp = useCallback(
		( event: PointerEvent ) => {
			if ( ! resizingRef.current ) {
				return;
			}
			const handleEl = event.currentTarget as HTMLElement | null;
			handleEl?.releasePointerCapture?.( event.pointerId );
			handleEl?.removeEventListener(
				'pointermove',
				handleResizePointerMove
			);
			handleEl?.removeEventListener( 'pointerup', handleResizePointerUp );
			handleEl?.removeEventListener(
				'lostpointercapture',
				handleResizePointerUp
			);
			resizingRef.current = null;
			setIsResizing( false );
			onResizeEndRef.current?.( {
				width: width.get(),
				height: height.get(),
			} );
		},
		[ handleResizePointerMove, width, height ]
	);

	const handleResizePointerDown = useCallback(
		( event: React.PointerEvent< HTMLDivElement > ) => {
			const handleEl = event.currentTarget;
			const edge = handleEl.dataset.resizeEdge;
			if ( ! edge ) {
				return;
			}
			event.preventDefault();
			handleEl.setPointerCapture( event.pointerId );

			resizingRef.current = {
				edge,
				startX: event.clientX,
				startY: event.clientY,
				startWidth: width.get(),
				startHeight: height.get(),
				startPosX: x.get(),
				startPosY: y.get(),
			};
			setIsResizing( true );

			handleEl.addEventListener( 'pointermove', handleResizePointerMove );
			handleEl.addEventListener( 'pointerup', handleResizePointerUp );
			handleEl.addEventListener(
				'lostpointercapture',
				handleResizePointerUp
			);
		},
		[ x, y, width, height, handleResizePointerMove, handleResizePointerUp ]
	);

	// Size morph. When resize is on, the content div reads width/height from the
	// motion values via style, so drive collapse/expand transitions imperatively.
	const prevChatStateRef = useRef( chatState );
	useEffect( () => {
		const prevChatState = prevChatStateRef.current;
		prevChatStateRef.current = chatState;

		if ( ! resizable ) {
			return;
		}

		let targetWidth: number = STYLE_CONSTANTS.COMPACT_WIDTH;
		if ( chatState === 'collapsed' ) {
			targetWidth = STYLE_CONSTANTS.COLLAPSED_SIZE;
		} else if ( chatState === 'expanded' ) {
			targetWidth = expandedSizeRef.current.width;
		}
		const targetHeight = getHeightForState( chatState );

		const wControls = animate( width, targetWidth, morphSpring );
		const hControls = animate( height, targetHeight, morphSpring );

		// The x-frame is COMPACT_WIDTH outside expanded and the resized width
		// inside it, so crossing that boundary changes the footprint x was docked
		// for — re-dock (corner-snap) or edge-pin (free-drag) with the frame delta.
		// Without this, collapsing a right-docked panel resized to 700 strands the
		// bubble (700 − 372)px away from its corner.
		const wasExpanded = prevChatState === 'expanded';
		const isExpanded = chatState === 'expanded';
		if ( wasExpanded !== isExpanded ) {
			const resizedWidth = expandedSizeRef.current.width;
			repositionForResize(
				isExpanded
					? resizedWidth - STYLE_CONSTANTS.COMPACT_WIDTH
					: STYLE_CONSTANTS.COMPACT_WIDTH - resizedWidth
			);
		}

		return () => {
			wControls.stop();
			hControls.stop();
		};
		// repositionForResize is a stable bridge (ref proxy from the composition
		// hook); listing it would re-run the morph on every parent render.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ chatState, resizable, width, height, getHeightForState ] );

	// Controlled-size reconciliation. Only runs when a consumer passes `size`;
	// undefined leaves the uncontrolled defaultSize path untouched. Reconciles the
	// clamped target into the live motion values (animating when expanded) and keeps
	// expandedSizeRef in sync so a later expand restores the controlled size.
	useEffect( () => {
		if ( ! resizable || ! size ) {
			return;
		}

		// Mid-gesture the pointer loop owns the motion values and the ref; the
		// per-move onResize→parent→size echo would otherwise re-run the clamp and
		// compare on every pointermove just to bail at the rounding guard.
		if ( resizingRef.current ) {
			return;
		}

		const target = clampSize( size );

		// Feedback guard: bail on the onResizeEnd→parent→size echo that lands here
		// with size already at target, so we never re-animate the committed size.
		if (
			Math.round( width.get() ) === Math.round( target.width ) &&
			Math.round( height.get() ) === Math.round( target.height )
		) {
			expandedSizeRef.current = target;
			return;
		}

		expandedSizeRef.current = target;

		if ( chatState !== 'expanded' ) {
			return;
		}

		// Frame-width delta = committed NEW width − live OLD width, read before
		// the springs start driving width away from the old value.
		const deltaWidth = target.width - width.get();

		const wControls = animate( width, target.width, morphSpring );
		const hControls = animate( height, target.height, morphSpring );

		// Reposition AFTER the ref commit (so getPanelSize reads the new size),
		// started alongside the size springs so the pinned edge stays fixed as the
		// panel grows in one motion.
		repositionForResize( deltaWidth );

		return () => {
			wControls.stop();
			hControls.stop();
		};
		// size is the trigger; clampSize/chatState/width/height/repositionForResize
		// are intentionally omitted so a re-animate fires only on a new size value.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ resizable, size?.width, size?.height ] );

	return {
		width,
		height,
		isResizing,
		expandedSizeRef,
		getPanelSize,
		clampSize,
		clampToViewport,
		getHeightForState,
		handleResizePointerDown,
	};
}
