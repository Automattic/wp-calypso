/* global calypsoifyGutenberg */

/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';
import { get } from 'lodash';

domReady( () => {
	const closeButtonInception = setInterval( function() {
		const closeButton = document.querySelector( '.edit-post-fullscreen-mode-close__toolbar a' );

		if ( ! closeButton ) {
			return;
		}

		clearInterval( closeButtonInception );

		// Add 'Checklist' label when the editor close button navigates back to checklist
		if ( get( calypsoifyGutenberg, 'closeUrl', '' ).includes( '/checklist/' ) ) {
			const checklistLabel = document.createElement( 'span' );
			checklistLabel.className = 'checklist-label';
			checklistLabel.innerHTML = 'Checklist';
			closeButton.appendChild( checklistLabel );
		}
	} );
} );
