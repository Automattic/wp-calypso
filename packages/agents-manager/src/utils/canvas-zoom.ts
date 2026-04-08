import { store as blockEditorStore } from '@wordpress/block-editor';
import { dispatch, select } from '@wordpress/data';
import { getCanvasIframeElements } from './canvas-iframe-elements';
import { unlock } from './unlock-private-apis';

const ZOOM_OUT_LEVEL = 0.5;

/**
 * Block double-click events to prevent editing during zoom-out mode.
 */
const blockDblclick = ( e: Event ) => {
	e.preventDefault();
	e.stopImmediatePropagation();
};

interface ZoomOutOptions {
	/** Whether to block double-click events on the canvas during zoom-out. */
	blockDoubleClick?: boolean;
}

export function zoomIn(): void {
	const { resetZoomLevel } = unlock( dispatch( blockEditorStore ) );
	const { __unstableSetEditorMode } = dispatch( blockEditorStore );

	resetZoomLevel();
	__unstableSetEditorMode( 'edit' );

	// Remove double-click blocker added during zoom-out.
	const { canvasIframeBody } = getCanvasIframeElements();
	canvasIframeBody?.removeEventListener( 'dblclick', blockDblclick, true );
}

export function zoomOut( options: ZoomOutOptions = {} ): void {
	const { setZoomLevel } = unlock( dispatch( blockEditorStore ) );
	const { __unstableSetEditorMode } = dispatch( blockEditorStore );

	setZoomLevel( ZOOM_OUT_LEVEL );
	__unstableSetEditorMode( 'zoom-out' );

	// Prevent double-click from entering edit mode while building a site.
	// The listener is removed in `zoomIn()`.
	if ( options.blockDoubleClick ) {
		const { canvasIframeBody } = getCanvasIframeElements();
		canvasIframeBody?.addEventListener( 'dblclick', blockDblclick, true );
	}
}

export function toggleZoom(): void {
	if ( unlock( select( blockEditorStore ) ).isZoomOut() ) {
		zoomIn();
	} else {
		zoomOut();
	}
}
