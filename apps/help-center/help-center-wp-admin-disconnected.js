import './config';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import './help-center.scss';

function initHelpCenterTracking() {
	// Check for agents-manager-masterbar first, then fall back to help-center
	const button =
		document.getElementById( 'wp-admin-bar-agents-manager' ) ||
		document.getElementById( 'wp-admin-bar-help-center' );

	if ( button && ! button.dataset.trackingInitialized ) {
		button.addEventListener( 'click', () => {
			recordTracksEvent( 'calypso_inlinehelp_show', {
				force_site_id: true,
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
