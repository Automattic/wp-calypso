import { useLayoutEffect, useRef, useState } from 'react';
import { useMotionValue } from 'framer-motion';
import {
	type ChatPosition,
	getChatPosition,
	getInitialChatPosition,
} from '../utils/chatStorage';
import type { BoundaryInsets, ChatSize, ChatState } from '../types';
import { DEFAULT_BOUNDARY_INSETS } from '../utils/constants';
import { useResizablePanel } from './useResizablePanel';
import { useFloatingPanelPosition } from './useFloatingPanelPosition';

export interface UseFloatingPanelArgs {
	resizable?: boolean | 'horizontal' | 'vertical';
	defaultSize?: ChatSize;
	size?: ChatSize;
	minSize?: Partial< ChatSize >;
	maxSize?: Partial< ChatSize >;
	chatState: ChatState;
	compactHeight: number;
	freeDrag: boolean;
	initialFreeDragPosition: { x: number; y: number } | undefined;
	initialChatPosition?: ChatPosition;
	onChatPositionChange?: ( position: ChatPosition ) => void;
	onFreeDragEnd?: ( position: { x: number; y: number } ) => void;
	onResize?: ( size: ChatSize ) => void;
	onResizeEnd?: ( size: ChatSize ) => void;
	// Per-side viewport insets (resolved boundaryInset).
	insets?: BoundaryInsets;
}

// Composes the two sub-hooks (resize owns width/height, drag owns snap/side) over
// a single shared x/y pair, so both agree on position. The one genuine cycle is
// broken by ordering: resize runs first and its stable accessors flow DIRECTLY
// into the drag hook; only drag→resize (repositionForResize) is bridged, via a
// ref written in useLayoutEffect (never during render — that was the old seam).
export function useFloatingPanel( {
	resizable = false,
	defaultSize,
	size,
	minSize,
	maxSize,
	chatState,
	compactHeight,
	freeDrag,
	initialFreeDragPosition,
	initialChatPosition,
	onChatPositionChange,
	onFreeDragEnd,
	onResize,
	onResizeEnd,
	insets = DEFAULT_BOUNDARY_INSETS,
}: UseFloatingPanelArgs ) {
	// Seed the shared x/y so a persisted free-drag position (or right-corner dock)
	// applies on mount. Lazy: useMotionValue only reads its argument on the first
	// render, so computing this per render paid a discarded localStorage read each
	// time. defaultSize only drives the corner seed when the panel actually mounts
	// at that size (resizable AND starting expanded) — every other mount renders
	// the fixed compact footprint, and a 600-wide seed would dock a 372-wide
	// launcher 228px off its corner.
	const [ seed ] = useState( () => {
		const mountsAtCustomSize =
			Boolean( resizable ) && chatState === 'expanded';
		return getInitialChatPosition( {
			freeDrag,
			initialFreeDragPosition,
			side: getChatPosition( initialChatPosition ),
			width: mountsAtCustomSize ? defaultSize?.width : undefined,
			height: mountsAtCustomSize ? defaultSize?.height : undefined,
			insets,
		} );
	} );
	const x = useMotionValue( seed.x );
	const y = useMotionValue( seed.y );

	// The drag→resize bridge. Resize is created before drag, so it can't reference
	// drag's repositionForResize yet; it calls this stable proxy, which the layout
	// effect below points at the real function after both hooks exist.
	const repositionForResizeRef = useRef< ( deltaWidth: number ) => void >(
		() => {}
	);

	const resize = useResizablePanel( {
		resizable,
		defaultSize,
		size,
		minSize,
		maxSize,
		chatState,
		compactHeight,
		insets,
		x,
		y,
		repositionForResize: ( deltaWidth ) =>
			repositionForResizeRef.current( deltaWidth ),
		onResize,
		// Free-drag persists an absolute x/y; a left/bottom-edge resize shifts x/y
		// to pin the opposite edge, so report the moved position or a close→reopen
		// restores the pre-resize spot. Already in-bounds (x floored at 0, y clamped).
		onResizeEnd: ( newSize: ChatSize ) => {
			onResizeEnd?.( newSize );
			if ( freeDrag ) {
				onFreeDragEnd?.( { x: x.get(), y: y.get() } );
			}
		},
	} );

	const position = useFloatingPanelPosition( {
		freeDrag,
		initialChatPosition,
		chatState,
		onChatPositionChange,
		onFreeDragEnd,
		x,
		y,
		getPanelSize: resize.getPanelSize,
		clampResizedSize: resize.clampToViewport,
		insets,
	} );

	useLayoutEffect( () => {
		repositionForResizeRef.current = position.repositionForResize;
	}, [ position.repositionForResize ] );

	return {
		// Position / drag
		x,
		y,
		currentSide: position.currentSide,
		isDragging: position.isDragging,
		dragControls: position.dragControls,
		chatRef: position.chatRef,
		constraintsRef: position.constraintsRef,
		handlePointerDown: position.handlePointerDown,
		handleDragStart: position.handleDragStart,
		handleDragEnd: position.handleDragEnd,
		// Resize
		width: resize.width,
		height: resize.height,
		isResizing: resize.isResizing,
		getHeightForState: resize.getHeightForState,
		handleResizePointerDown: resize.handleResizePointerDown,
	};
}
