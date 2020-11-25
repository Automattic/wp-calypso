/**
 * External dependencies
 */
import * as React from 'react';
import { registerPlugin as originalRegisterPlugin, PluginSettings } from '@wordpress/plugins';
import { useSelect } from '@wordpress/data';
import { doAction, hasAction } from '@wordpress/hooks';
import { addQueryArgs } from '@wordpress/url';
import FocusedLaunchModal from '@automattic/launch';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from './stores';

const redirectParentWindow = ( url: string ) => {
	window.top.location.href = url;
};

const HOOK_OPEN_CHECKOUT_MODAL = 'a8c.wpcom-block-editor.openCheckoutModal';

const registerPlugin = ( name: string, settings: Omit< PluginSettings, 'icon' > ) =>
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	originalRegisterPlugin( name, settings as any );

registerPlugin( 'a8c-editor-editor-focused-launch', {
	render: function LaunchSidebar() {
		const currentSiteId = window._currentSiteId;

		const isFocusedLaunchOpen = useSelect( ( select ) =>
			select( LAUNCH_STORE ).isFocusedLaunchOpen()
		);

		if ( ! isFocusedLaunchOpen ) {
			return null;
		}

		const handleCheckout = ( siteId = currentSiteId, isEcommerce = false ) => {
			// open checkout modal assuming the cart is already updated
			if ( hasAction( HOOK_OPEN_CHECKOUT_MODAL ) ) {
				doAction( HOOK_OPEN_CHECKOUT_MODAL );
				return;
			}

			// fallback: redirect to /checkout page
			const checkoutUrl = addQueryArgs( `https://wordpress.com/checkout/${ siteId }`, {
				// Redirect to My Home after checkout only if the selected plan is not eCommerce
				...( ! isEcommerce && { redirect_to: `/home/${ siteId }` } ),
			} );
			redirectParentWindow( checkoutUrl );
		};

		return (
			<FocusedLaunchModal
				siteId={ currentSiteId }
				openCheckout={ handleCheckout }
				locale={ document.documentElement.lang }
				redirectTo={ ( url: string ) => {
					const origin = 'https://wordpress.com';
					const path = url.startsWith( '/' ) ? url : `/${ url }`;
					redirectParentWindow( `${ origin }${ path }` );
				} }
			/>
		);
	},
} );
