import './config';
import './help-center.scss';
import { recordDisconnectedHostTracksEvent } from './tracks';

function initHelpCenterTracking() {
	const button = document.getElementById( 'wp-admin-bar-help-center' );

	if ( button && ! button.dataset.trackingInitialized ) {
		button.addEventListener( 'click', () => {
			recordDisconnectedHostTracksEvent( 'calypso_inlinehelp_show', {
				location: 'help-center',
				section: 'wp-admin-disconnected',
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
