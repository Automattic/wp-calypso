import { select, useSelect } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useEffect } from 'react';
import tracksRecordEvent from './track-record-event';

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I know using unstable features means my plugin or theme will inevitably break on the next WordPress release.',
	'@wordpress/block-editor'
);

const SiteEditorLoad = () => {
	const canvasMode = useSelect(
		( _select ) =>
			_select( 'core/edit-site' ) && unlock( _select( 'core/edit-site' ) ).getCanvasMode(),
		[]
	);

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
