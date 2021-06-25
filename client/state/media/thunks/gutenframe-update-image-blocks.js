/**
 * Internal dependencies
 */
import { isEditorIframeLoaded, getEditorIframePort } from 'calypso/state/editor/selectors';

const createMediaGutenframePayload = ( status, mediaItem ) => ( {
	id: mediaItem.ID,
	height: mediaItem.height,
	status,
	url: mediaItem.URL,
	width: mediaItem.width,
} );

export const gutenframeUpdateImageBlocks = ( mediaItem, action ) => ( dispatch, getState ) => {
	const state = getState();

	if ( isEditorIframeLoaded( state ) ) {
		const iframePort = getEditorIframePort( state );

		if ( ! ( iframePort && iframePort.postMessage ) ) {
			return;
		}

		const payload = createMediaGutenframePayload( action, mediaItem );
		iframePort.postMessage( { action: 'updateImageBlocks', payload } );
	}
};
