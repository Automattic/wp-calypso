/* global __i18n_text_domain__ */
import './config';
import { dispatch, select, subscribe } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

const unsubscribe = subscribe( () => {
	// Make sure the wp-logo menu item is registered before unregistering its default items.
	// Use optional chaining since 'next-admin' store only exists in next-admin context
	if ( select( 'next-admin' )?.getMetaMenuItems?.( 'wp-logo' )?.length > 1 ) {
		unsubscribe();
		// wait for the next tick to ensure the menu items are registered
		queueMicrotask( () => {
			select( 'next-admin' )
				?.getMetaMenuItems?.( 'wp-logo' )
				?.forEach( ( item ) => {
					dispatch( 'next-admin' )?.unregisterSiteHubHelpMenuItem?.( item.id );
				} );
			dispatch( 'next-admin' )?.registerSiteHubHelpMenuItem?.( 'help-center', {
				label: __( 'Help Center', __i18n_text_domain__ ),
				parent: 'wp-logo',
				callback: () => {
					window.open( 'https://wordpress.com/help', '_blank' );
				},
			} );
		} );
	}
} );
