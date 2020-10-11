/* global fullSiteEditing */
/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import { dispatch } from '@wordpress/data';
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
