import domReady from '@wordpress/dom-ready';

function injectNavigationToggleOnClickHandler() {
	// Prevent adding the event listener multiple times
	if ( document.querySelector( '.wpcom-edit-site-navigation-toggle__button' ) ) {
		return;
	}

	const toggle = document.querySelector( '.edit-site-navigation-toggle' );
	if ( ! toggle ) {
		return;
	}

	// Add a CSS class to determine if the event listener has been added already
	toggle.classList.add( 'wpcom-edit-site-navigation-toggle__button' );

	toggle.addEventListener( 'click', ( event ) => {
		event.preventDefault();
		event.stopPropagation();
		const calypsoCloseUrl = window?.calypsoifyGutenberg?.closeUrl;
		if ( calypsoCloseUrl ) {
			window.top.location.href = calypsoCloseUrl;
		} else {
			window.location.href = './index.php';
		}
	} );
}

/**
 * Customize the navigation sidebar toggle click handler to simply navigate back home.
 */
domReady( () => {
	if ( ! window.wp.editSite ) {
		return;
	}

	const waitForNavigationToggleButton = setInterval( () => {
		const toggleButton = document.querySelector( '.edit-site-navigation-toggle__button' );
		if ( ! toggleButton ) {
			return;
		}
		clearInterval( waitForNavigationToggleButton );

		injectNavigationToggleOnClickHandler();

		// Re-inject the navigation toggle click handler as needed in case React re-renders the navigation sidebar
		const wpbody = document.getElementById( 'wpbody' );
		if ( wpbody && typeof window.MutationObserver !== 'undefined' ) {
			const observer = new window.MutationObserver( injectNavigationToggleOnClickHandler );
			observer.observe( wpbody, { subtree: true, childList: true } );
		}
	} );
} );
