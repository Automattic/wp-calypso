import { dispatch } from '@wordpress/data';
import domReady from '@wordpress/dom-ready';
import { getQueryArg } from '@wordpress/url';

export function hidePostEditorSidebar() {
	const showLaunchpad = getQueryArg( window.location.search, 'showLaunchpad' );
	if ( 'true' === showLaunchpad ) {
		dispatch( 'core/edit-post' ).closeGeneralSidebar();
	}
}

domReady( hidePostEditorSidebar );
