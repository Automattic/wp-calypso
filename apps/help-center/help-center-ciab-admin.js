/* global __i18n_text_domain__ */
import './config';
import apiFetch from '@wordpress/api-fetch';
import { dispatch, select, subscribe } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import './help-center.scss';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import loadHelpCenter from './async-help-center';

async function shouldAutoLoadHelpCenter() {
	const preferences = canAccessWpcomApis()
		? await wpcomRequest( {
				path: '/me/preferences',
				apiNamespace: 'wpcom/v2',
		  } )
				.then( ( prefs ) => prefs.calypso_preferences )
				.catch( () => {} )
		: await apiFetch( {
				global: true,
				path: '/help-center/open-state',
		  } ).catch( () => {} );

	return preferences?.help_center_open;
}

const unsubscribe = subscribe( () => {
	// Make sure the wp-logo menu item is registered before unregistering its default items.
	// Use optional chaining since 'next-admin' store only exists in next-admin context
	if ( select( 'next-admin' )?.getMetaMenuItems?.( 'wp-logo' )?.length > 1 ) {
		unsubscribe();
		// Check if the user has the HC already open from a previous session.
		shouldAutoLoadHelpCenter().then( ( shouldAutoLoad ) => {
			if ( shouldAutoLoad ) {
				loadHelpCenter();
			}
		} );
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
					return loadHelpCenter().then( () => {
						const state = select( 'automattic/help-center' ).isHelpCenterShown();
						dispatch( 'automattic/help-center' ).setShowHelpCenter( ! state );
					} );
				},
			} );
		} );
	}
} );
