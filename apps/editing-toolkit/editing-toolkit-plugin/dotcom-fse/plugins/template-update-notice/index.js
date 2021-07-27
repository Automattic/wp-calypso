/* global fullSiteEditing */

import { dispatch } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';

domReady( () => {
	if ( 'wp_template_part' !== fullSiteEditing.editorPostType ) {
		return;
	}
	dispatch( 'core/notices' ).createNotice(
		'info',
		__( 'Updates to this template will affect all pages on your site.', 'full-site-editing' ),
		{
			isDismissible: false,
		}
	);
} );
