/* global fullSiteEditing */
/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import { render } from '@wordpress/element';
import { Notice } from '@wordpress/components';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import './style.scss';

domReady( () => {
	if ( 'wp_template_part' !== fullSiteEditing.editorPostType ) {
		return;
	}
	const element = document.createElement( 'div' );
	element.classList.add( 'wp-block-a8c-template-edit-warning' );
	document.getElementsByClassName( 'edit-post-layout__content' )[ 0 ].prepend( element );
	render(
		<Notice isDismissible={ false }>
			{ __( 'Updates to this block will affect multiple pages on your site' ) }
		</Notice>,
		element
	);
} );
