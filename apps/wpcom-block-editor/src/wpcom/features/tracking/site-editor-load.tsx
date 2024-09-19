import { select, useSelect } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { useEffect } from 'react';
import tracksRecordEvent from './track-record-event';

/**
 * Sometimes Gutenberg doesn't allow you to re-register the module and throws an error.
 * FIXME: The new version allow it by default, but we might need to ensure that all the site has the new version.
 * @see https://github.com/Automattic/wp-calypso/pull/79663
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let unlock: ( object: any ) => any | undefined;
try {
	unlock = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
		'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
		'@wordpress/edit-site'
	).unlock;
} catch ( error ) {
	// eslint-disable-next-line no-console
	console.error( 'Error: Unable to get the unlock api. Reason: %s', error );
}

const SiteEditorLoad = () => {
	const canvasMode = useSelect(
		( _select ) =>
			unlock &&
			_select( 'core/edit-site' ) &&
			unlock( _select( 'core/edit-site' ) ).getCanvasMode(),
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
