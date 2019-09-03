/**
 * External dependencies
 */
import domReady from '@wordpress/dom-ready';

domReady( () => {
	const editPostHeaderInception = setInterval( function() {
		const closeButton = document.querySelector( '.edit-post-fullscreen-mode-close__toolbar a' );

		if ( ! closeButton ) {
			return;
		}

		clearInterval( editPostHeaderInception );

		// When closing Template CPT (e.g. header) to navigate back to parent page.
		if ( true ) {
			const checklistLabel = document.createElement( 'span' );
			checklistLabel.className = 'checklist-label';
			checklistLabel.innerHTML = 'Checklist';
			closeButton.appendChild( checklistLabel );
		}
	} );
} );
