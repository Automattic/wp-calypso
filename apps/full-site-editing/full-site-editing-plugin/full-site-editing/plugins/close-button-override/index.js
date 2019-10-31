/* global fullSiteEditing */

/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import { __ } from '@wordpress/i18n';
import './style.scss';

domReady( () => {
	const { closeButtonLabel, closeButtonUrl, editorPostType } = fullSiteEditing;

	const editPostHeaderInception = setInterval( () => {
		// cycle through interval until header toolbar is found
		const toolbar = document.querySelector( '.edit-post-header__toolbar' );

		if ( ! toolbar ) {
			return;
		}
		clearInterval( editPostHeaderInception );

		// add components toolbar with override class name (original will be hidden in ./style.scss)
		const componentsToolbar = document.createElement( 'div' );
		componentsToolbar.className =
			'components-toolbar edit-post-fullscreen-mode-close__toolbar edit-post-fullscreen-mode-close__toolbar__override';
		toolbar.prepend( componentsToolbar );

		// create custom close button and append to components toolbar
		const newCloseButton = document.createElement( 'a' );
		// When closing Template CPT (e.g. header) to navigate back to parent page.
		if ( 'wp_template_part' === editorPostType && closeButtonUrl ) {
			newCloseButton.href = closeButtonUrl;
			newCloseButton.innerHTML = closeButtonLabel;
			newCloseButton.setAttribute( 'aria-label', closeButtonLabel );
		} else if ( 'page' === editorPostType ) {
			newCloseButton.href = 'edit.php?post_type=page';
			const newLabel = __( 'Back to Page List' );
			newCloseButton.innerHTML = newLabel;
			newCloseButton.setAttribute( 'aria-label', newLabel );
		}

		newCloseButton.className = 'components-button components-icon-button is-button is-default';
		componentsToolbar.prepend( newCloseButton );
	} );
} );
