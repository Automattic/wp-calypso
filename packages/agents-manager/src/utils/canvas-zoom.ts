import { store as blockEditorStore } from '@wordpress/block-editor';
import { dispatch, select } from '@wordpress/data';
import { unlock } from './unlock-private-apis';

const ZOOM_OUT_LEVEL = 0.5;

export function zoomIn(): void {
	const { resetZoomLevel } = unlock( dispatch( blockEditorStore ) );
	const { __unstableSetEditorMode } = dispatch( blockEditorStore );

	resetZoomLevel();
	__unstableSetEditorMode( 'edit' );
}

export function zoomOut(): void {
	const { setZoomLevel } = unlock( dispatch( blockEditorStore ) );
	const { __unstableSetEditorMode } = dispatch( blockEditorStore );

	setZoomLevel( ZOOM_OUT_LEVEL );
	__unstableSetEditorMode( 'zoom-out' );
}

export function toggleZoom(): void {
	if ( unlock( select( blockEditorStore ) ).isZoomOut() ) {
		zoomIn();
	} else {
		zoomOut();
	}
}
