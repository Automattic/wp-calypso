import { select } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import { useEffect } from 'react';
import useCanvasMode from '../../hooks/use-canvas-mode';
import tracksRecordEvent from './track-record-event';

const SiteEditorLoad = () => {
	const canvasMode = useCanvasMode();

	useEffect( () => {
		// Don't send the event in the Post Editor context.
		if ( select( 'core/edit-site' ) ) {
			tracksRecordEvent( 'wpcom_site_editor_set_canvas_mode', { mode: canvasMode } );
		}
	}, [ canvasMode ] );

	useEffect( () => {
		// Don't send the event in the Post Editor context.
		if ( select( 'core/edit-site' ) ) {
			// this is no longer, strictly speaking, a "calypso" page view, but this is for back compat post-un-iframing.
			tracksRecordEvent( 'calypso_page_view', { path: '/:post_type/:site' } );
		}
	}, [] );

	return null;
};

registerPlugin( 'wpcom-site-editor-load', {
	render: () => {
		return <SiteEditorLoad />;
	},
} );
