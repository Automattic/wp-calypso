/* global fullSiteEditing */

/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import ReactDOM from 'react-dom';
import { __ } from '@wordpress/i18n';
import { Button, Dashicon } from '@wordpress/components';
import './style.scss';

domReady( () => {
	const { closeButtonUrl, editorPostType } = fullSiteEditing;
	let { closeButtonLabel } = fullSiteEditing;

	// Only alter for the page and template part editors.
	if ( 'wp_template_part' !== editorPostType && 'page' !== editorPostType ) {
		return;
	}

	const editPostHeaderInception = setInterval( () => {
		// Cycle through interval until header toolbar is found.
		const toolbar = document.querySelector( '.edit-post-header__toolbar' );

		if ( ! toolbar ) {
			return;
		}
		clearInterval( editPostHeaderInception );

		// Add components toolbar with override class name (original will be hidden in ./style.scss).
		const componentsToolbar = document.createElement( 'div' );
		componentsToolbar.className =
			'components-toolbar edit-post-fullscreen-mode-close__toolbar edit-post-fullscreen-mode-close__toolbar__override';
		toolbar.prepend( componentsToolbar );

		// Create custom close button and append to components toolbar.
		const newCloseButton = document.createElement( 'a' );
		// When closing Template CPT (e.g. header) to navigate back to parent page.
		if ( 'wp_template_part' === editorPostType && closeButtonUrl ) {
			newCloseButton.href = closeButtonUrl;
			newCloseButton.innerHTML = closeButtonLabel;
			newCloseButton.className = 'components-button components-icon-button is-button is-default';
			newCloseButton.setAttribute( 'aria-label', closeButtonLabel );
		} else if ( 'page' === editorPostType ) {
			newCloseButton.href = 'edit.php?post_type=page';
			closeButtonLabel = __( 'Back to Page List' );
			newCloseButton.setAttribute( 'aria-label', closeButtonLabel );
			newCloseButton.className = 'components-button';

			ReactDOM.render(
				<Button className="components-button components-icon-button">
					<Dashicon icon="arrow-left-alt2" />
				</Button>,
				newCloseButton
			);
		}

		componentsToolbar.prepend( newCloseButton );
	} );
} );
