import { select, dispatch, subscribe } from '@wordpress/data';

// Temporary change that prevents opening the Site Editor's navigation sidebar,
// and instead simply navigates back home on click.
const unsubscribe = subscribe( () => {
	if ( ! window.wp.editSite ) {
		return unsubscribe();
	}
	if ( select( 'core/edit-site' ).isNavigationOpened() ) {
		dispatch( 'core/edit-site' ).setIsNavigationPanelOpened( false );

		const calypsoCloseUrl = window?.calypsoifyGutenberg?.closeUrl;
		if ( calypsoCloseUrl ) {
			window.top.location.href = calypsoCloseUrl;
		} else {
			window.location.href = './index.php';
		}
	}
} );
