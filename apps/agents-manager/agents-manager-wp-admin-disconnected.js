/**
 * WP Admin disconnected variant entry point.
 *
 * This lightweight variant is used when:
 * - The unified experience is disabled
 * - The help center icon is displayed by PHP (already in the admin bar)
 * - Full Agents Manager functionality is not needed
 *
 * The disconnected variant is truly minimal - it doesn't render any UI.
 * The help icon is already provided by the PHP admin bar Item component
 * as a direct link to the help page. This file just adds tracking for clicks.
 */
/* global agentsManagerData */
import './config';
import { recordTracksEvent, withSiteContext } from '@automattic/calypso-analytics';

// Import WordPress admin bar integration styles
import '@automattic/agents-manager/src/hooks/use-admin-bar-integration/style.scss';

// Admin bar element selector
const ADMIN_BAR_BUTTON_ID = 'wp-admin-bar-agents-manager';

/**
 * Initialize tracking for help center icon clicks
 */
function initHelpCenterTracking() {
	const button = document.getElementById( ADMIN_BAR_BUTTON_ID );

	if ( ! button || button.dataset.trackingInitialized ) {
		return;
	}

	// Track help center icon click
	button.addEventListener( 'click', () => {
		recordTracksEvent(
			'calypso_inlinehelp_show',
			withSiteContext(
				{
					location: 'help-center',
					section: 'wp-admin',
				},
				[
					[
						'agents_manager_data',
						typeof agentsManagerData !== 'undefined' && agentsManagerData?.isWpcomPlatform === true
							? agentsManagerData?.site?.ID
							: undefined,
					],
				]
			)
		);
	} );

	// Prevent multiple initializations
	button.dataset.trackingInitialized = 'true';
}

// Initialize when DOM is ready
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initHelpCenterTracking );
} else {
	initHelpCenterTracking();
}
