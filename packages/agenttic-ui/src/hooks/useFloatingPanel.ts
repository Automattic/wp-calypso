import { useLayoutEffect, useRef } from 'react';
import { useMotionValue } from 'framer-motion';
import {
	type ChatPosition,
	getChatPosition,
	getInitialChatPosition,
} from '../utils/chatStorage';
import type { ChatSize, ChatState } from '../types';
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
}: UseFloatingPanelArgs ) {
	// Seed the shared x/y so a persisted free-drag position (or right-corner dock)
	// applies on mount. Read once — the drag hook reconciles side changes after.
	const { x: seedX, y: seedY } = getInitialChatPosition( {
		freeDrag,
		initialFreeDragPosition,
		side: getChatPosition( initialChatPosition ),
		width: defaultSize?.width,
		height: defaultSize?.height,
	} );
	const x = useMotionValue( seedX );
	const y = useMotionValue( seedY );

	// The drag→resize bridge. Resize is created before drag, so it can't reference
	// drag's repositionForResize yet; it calls this stable proxy, which the layout
	// effect below points at the real function after both hooks exist.
	const repositionForResizeRef = useRef< () => void >( () => {} );

	const resize = useResizablePanel( {
		resizable,
		defaultSize,
		size,
		minSize,
		maxSize,
		chatState,
		compactHeight,
		x,
		y,
		repositionForResize: () => repositionForResizeRef.current(),
		onResize,
		onResizeEnd,
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
		getLiveWidth: resize.getLiveWidth,
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
		expandedSizeRef: resize.expandedSizeRef,
		getPanelSize: resize.getPanelSize,
		getHeightForState: resize.getHeightForState,
		handleResizePointerDown: resize.handleResizePointerDown,
	};
}
