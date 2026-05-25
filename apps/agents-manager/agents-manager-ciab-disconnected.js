/**
 * CIAB (Commerce in a Box) disconnected variant entry point.
 *
 * This lightweight variant is used when:
 * - The unified experience is disabled
 * - We're in the CIAB admin environment (ATOMIC_CLIENT_ID === 118)
 * - Full Agents Manager functionality is not needed
 *
 * Registers a help center menu item in the Site Hub using the next-admin store.
 */

/* global agentsManagerData */

import { recordTracksEvent } from '@automattic/calypso-analytics';
import { dispatch, select, subscribe } from '@wordpress/data';

const unsubscribe = subscribe( () => {
	// Make sure the wp-logo menu item is registered before unregistering its default items.
	// Use optional chaining since 'next-admin' store only exists in next-admin context
	if ( select( 'next-admin' )?.getMetaMenuItems?.( 'wp-logo' )?.length > 1 ) {
		unsubscribe();
		// wait for the next tick to ensure the menu items are registered
		queueMicrotask( () => {
			// Unregister default help items
			select( 'next-admin' )
				?.getMetaMenuItems?.( 'wp-logo' )
				?.forEach( ( item ) => {
					dispatch( 'next-admin' )?.unregisterSiteHubHelpMenuItem?.( item.id );
				} );

			// Get help center URL from inline data or use default
			const helpCenterUrl =
				typeof agentsManagerData !== 'undefined' && agentsManagerData?.helpCenterUrl
					? agentsManagerData.helpCenterUrl
					: 'https://wordpress.com/help';

			// Register agents manager help center menu item
			dispatch( 'next-admin' )?.registerSiteHubHelpMenuItem?.( 'agents-manager-help-center', {
				label: 'Help Center',
				parent: 'wp-logo',
				callback: () => {
					recordTracksEvent( 'calypso_inlinehelp_show', {
						force_site_id: true,
						location: 'help-center',
						section: 'ciab-admin',
					} );
					window.open( helpCenterUrl, '_blank', 'noopener,noreferrer' );
				},
			} );
		} );
	}
} );
