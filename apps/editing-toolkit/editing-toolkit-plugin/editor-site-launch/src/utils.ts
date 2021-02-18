/**
 * External dependencies
 */
import { doAction, hasAction } from '@wordpress/hooks';
import { addQueryArgs } from '@wordpress/url';
import { FOCUSED_LAUNCH_FLOW, IMMEDIATE_LAUNCH_QUERY_ARG } from './constants';

// When running in Calypso, currentCalypsoUrl is used.
// When running in WP-Admin, window.location.href is used.
export const getCurrentLaunchFlowUrl = (): string =>
	window?.calypsoifyGutenberg?.currentCalypsoUrl ?? window.location.href;

export const redirectParentWindow = ( url: string ): void => {
	window.top.location.href = url;
};

export const redirectToWpcomPath = ( url: string ): void => {
	const origin = new URL( getCurrentLaunchFlowUrl() )?.origin || 'https://wordpress.com';

	const path = url.startsWith( '/' ) ? url : `/${ url }`;
	redirectParentWindow( `${ origin }${ path }` );
};

/**
 * Opens the checkout.
 *
 * If possible, the checkout is opened as a modal without a page redirect (for Focused Launch).
 * Otherwise, as a fallback, the user is redirected to the /checkout page or the /home page
 * (in this case, `siteSlug` and `isEcommerce` params are used to construct the redirect url)
 *
 * @param siteSlug The slug (id) of the current site.
 * @param isEcommerce True if the eCommerce plan is going to be in the checkout.
 * @param onSuccessCallback Called when the checkout opens as a modal and is completed successfully
 */
export const openCheckout = (
	siteSlug = window._currentSiteId.toString(),
	isEcommerce = false,
	onSuccessCallback?: () => void
): void => {
	const HOOK_OPEN_CHECKOUT_MODAL = 'a8c.wpcom-block-editor.openCheckoutModal';
	const isFocusedLaunchFlow = window?.wpcomEditorSiteLaunch?.launchFlow === FOCUSED_LAUNCH_FLOW;
	const urlWithoutArgs = getCurrentLaunchFlowUrl().split( '?' )[ 0 ];

	// only in focused launch, open checkout modal assuming the cart is already updated
	if ( hasAction( HOOK_OPEN_CHECKOUT_MODAL ) && isFocusedLaunchFlow ) {
		doAction( HOOK_OPEN_CHECKOUT_MODAL, {
			checkoutOnSuccessCallback: onSuccessCallback,
			isFocusedLaunch: true,
			redirectTo: addQueryArgs( urlWithoutArgs, {
				[ IMMEDIATE_LAUNCH_QUERY_ARG ]: true,
			} ),
		} );
		return;
	}

	// fallback: redirect to /checkout page
	const checkoutUrl = addQueryArgs( `/checkout/${ siteSlug }`, {
		// Redirect to My Home after checkout only if the selected plan is not eCommerce
		...( ! isEcommerce && { redirect_to: `/home/${ siteSlug }` } ),
	} );
	redirectToWpcomPath( checkoutUrl );
};
