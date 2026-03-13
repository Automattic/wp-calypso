/**
 * WooAI disconnected variant entry point.
 *
 * This lightweight variant is used when:
 * - The WooCommerce AI plugin is active but Jetpack is not connected
 * - Full Agents Manager functionality is not available
 *
 * Renders a connect prompt directing the user to the connection settings.
 */

/* global agentsManagerData */

import { recordTracksEvent } from '@automattic/calypso-analytics';

/**
 * Initialize the disconnected state UI.
 *
 * Finds the WooAI agents manager container and adds a connect prompt
 * linking to the Jetpack connection settings page.
 */
function initDisconnectedState() {
	// Render into the admin bar dropdown created by PHP.
	const container = document.getElementById( 'agents-manager-masterbar' );

	if ( ! container ) {
		return;
	}

	// Get connection URL from inline data or fall back to Jetpack connection page
	const connectionUrl =
		typeof agentsManagerData !== 'undefined' && agentsManagerData?.connectionUrl
			? agentsManagerData.connectionUrl
			: 'admin.php?page=wc-settings&tab=woocommerce-ai';

	const link = document.createElement( 'a' );
	link.href = connectionUrl;
	link.textContent = 'Connect to enable AI features';
	link.className = 'agents-manager-wooai-connect-link';
	link.addEventListener( 'click', () => {
		recordTracksEvent( 'wooai_agents_manager_connect_click', {
			force_site_id: true,
			location: 'agents-manager',
			section: 'wooai-admin',
		} );
	} );

	container.appendChild( link );
}

// Initialize when DOM is ready
if ( document.readyState === 'loading' ) {
	document.addEventListener( 'DOMContentLoaded', initDisconnectedState );
} else {
	initDisconnectedState();
}
