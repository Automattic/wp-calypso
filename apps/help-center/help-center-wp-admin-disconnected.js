import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import './help-center.scss';

function initHelpCenterTracking() {
	const button = document.getElementById( 'wp-admin-bar-help-center' );

	if ( button && ! button.dataset.trackingInitialized ) {
		button.addEventListener( 'click', () => {
			recordTracksEvent( 'calypso_inlinehelp_show', {
				force_site_id: true,
				location: 'help-center',
				section: 'wp-admin',
				jetpack_disconnected_site: true,
			} );
		} );

		// Prevent multiple initializations
		button.dataset.trackingInitialized = 'true';
	}
}

if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initHelpCenterTracking );
} else {
	initHelpCenterTracking();
}
