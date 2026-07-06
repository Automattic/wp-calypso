import { useCallback, useEffect, useRef, useState } from 'react';

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
	// panel re-clamps/re-snaps. Bridged in by the composition hook.
	repositionForResize: () => void;
	onResize?: ( size: ChatSize ) => void;
	onResizeEnd?: ( size: ChatSize ) => void;
}

export interface UseResizablePanelResult {
	width: MotionValue< number >;
	height: MotionValue< number >;
	isResizing: boolean;
	expandedSizeRef: React.MutableRefObject< ChatSize >;
	getPanelSize: () => ChatSize;
	getConstraintBox: () => { width: number; height: number };
	clampSize: ( size: ChatSize ) => ChatSize;
	// Clamps the committed expanded size back into the current viewport, writing
	// the corrected size to the motion values + ref. The drag hook's window-resize
	// handler calls this before re-clamping position.
	clampToViewport: () => void;
	// Reads the LIVE width motion value. Mid-grow, expandedSizeRef holds the NEW
	// width while the spring still drives width.get() to the OLD one; their delta
	// is the exact grow amount the drag hook uses to shift the pinned edge.
	getLiveWidth: () => number;
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

	// Live panel size. Returns the resized size only when expanded; other states
	// keep the fixed footprint.
	const getPanelSize = useCallback( (): ChatSize => {
		if ( resizable && chatState === 'expanded' ) {
			return { ...expandedSizeRef.current };
		}
		return {
			width: STYLE_CONSTANTS.COMPACT_WIDTH,
			height: STYLE_CONSTANTS.EXPANDED_HEIGHT,
		};
	}, [ resizable, chatState ] );

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

	const getLiveWidth = (): number => width.get();

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

			const clamped = clampSize( {
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
			onResize?.( clamped );
		},
		[ clampSize, x, y, width, height, onResize ]
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
			onResizeEnd?.( { width: width.get(), height: height.get() } );
		},
		[ handleResizePointerMove, width, height, onResizeEnd ]
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
	useEffect( () => {
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
		return () => {
			wControls.stop();
			hControls.stop();
		};
	}, [ chatState, resizable, width, height, getHeightForState ] );

	// Controlled-size reconciliation. Only runs when a consumer passes `size`;
	// undefined leaves the uncontrolled defaultSize path untouched. Reconciles the
	// clamped target into the live motion values (animating when expanded) and keeps
	// expandedSizeRef in sync so a later expand restores the controlled size.
	useEffect( () => {
		if ( ! resizable || ! size ) {
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

		const wControls = animate( width, target.width, morphSpring );
		const hControls = animate( height, target.height, morphSpring );

		// Reposition AFTER the ref commit (so getPanelSize reads the new size),
		// started alongside the size springs so the pinned edge stays fixed as the
		// panel grows in one motion.
		repositionForResize();

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
		getConstraintBox,
		clampSize,
		clampToViewport,
		getLiveWidth,
		getHeightForState,
		handleResizePointerDown,
	};
}
