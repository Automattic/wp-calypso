/**
 * External dependencies
 */
import { doAction, hasAction } from '@wordpress/hooks';
import { addQueryArgs } from '@wordpress/url';

interface CalypsoifyWindow extends Window {
	currentSiteId?: number;
	calypsoifyGutenberg?: {
		isSiteUnlaunched?: boolean;
		isFocusedLaunchFlow?: boolean;
		[ key: string ]: unknown;
	};
}
declare const window: CalypsoifyWindow;

export const redirectParentWindow = ( url: string ) => {
	window.top.location.href = url;
};

export const redirectToWpcomPath = ( url: string ) => {
	const origin = 'https://wordpress.com';
	const path = url.startsWith( '/' ) ? url : `/${ url }`;
	redirectParentWindow( `${ origin }${ path }` );
};

export const openCheckout = ( siteId = window?.currentSiteId, isEcommerce = false ) => {
	const HOOK_OPEN_CHECKOUT_MODAL = 'a8c.wpcom-block-editor.openCheckoutModal';
	const isFocusedLaunchFlow = window?.calypsoifyGutenberg?.isFocusedLaunchFlow;

	// only in focused launch, open checkout modal assuming the cart is already updated
	if ( hasAction( HOOK_OPEN_CHECKOUT_MODAL ) && isFocusedLaunchFlow ) {
		doAction( HOOK_OPEN_CHECKOUT_MODAL );
		return;
	}

	// fallback: redirect to /checkout page
	const checkoutUrl = addQueryArgs( `/checkout/${ siteId }`, {
		// Redirect to My Home after checkout only if the selected plan is not eCommerce
		...( ! isEcommerce && { redirect_to: `/home/${ siteId }` } ),
	} );
	redirectToWpcomPath( checkoutUrl );
};
