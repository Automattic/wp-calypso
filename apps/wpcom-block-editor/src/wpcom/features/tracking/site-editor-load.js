import { select } from '@wordpress/data';
import { registerPlugin } from '@wordpress/plugins';
import tracksRecordEvent from './track-record-event';

registerPlugin( 'wpcom-site-editor-load', {
	render: () => {
		// This also loads in the Post Editor context.
		if ( ! select( 'core/edit-site' ) ) {
			return;
		}
		// this is no longer, strictly speaking, a "calypso" page view, but this is for back compat post-un-iframing.
		tracksRecordEvent( 'calypso_page_view', { path: '/:post_type/:site' } );
		// @todo handle canvas=edit case: is the nav sidebar open? None of the `select('core/edit-site')` selectors seem to work.
	},
} );
