/* global fullSiteEditing */
/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';

/**
 * Internal dependencies
 */
import TemplateUpdateConfirmationButton from './button';

domReady( () => {
	if ( 'wp_template_part' !== fullSiteEditing.editorPostType ) {
		return;
	}
	const element = document.createElement( 'div' );
	element.id = 'template-update-confirmation';
	document.getElementById( 'wpcontent' ).appendChild( element );
	render( <TemplateUpdateConfirmationButton />, element );
} );
