/**
 * External dependencies
 */
import { doAction, hasAction } from '@wordpress/hooks';
import { addQueryArgs } from '@wordpress/url';
import { FOCUSED_LAUNCH_FLOW, IMMEDIATE_LAUNCH_QUERY_ARG } from './constants';

interface CalypsoifyWindow extends Window {
	currentSiteId?: number;
	calypsoifyGutenberg?: {
		isFocusedLaunchFlow: boolean;
		isSiteUnlaunched?: boolean;
		currentCalypsoUrl?: string;
		[ key: string ]: unknown;
	};
}
declare const window: CalypsoifyWindow;

export const getCurrentLaunchFlowUrl = (): string => {
	try {
		return window?.calypsoifyGutenberg?.currentCalypsoUrl || window.location.href;
	} catch ( err ) {
		return '';
	}
};

export const redirectParentWindow = ( url: string ): void => {
	window.top.location.href = url;
};

export const redirectToWpcomPath = ( url: string ): void => {
	const origin = new URL( getCurrentLaunchFlowUrl() )?.origin || 'https://wordpress.com';

	const path = url.startsWith( '/' ) ? url : `/${ url }`;
	redirectParentWindow( `${ origin }${ path }` );
};

export const openCheckout = (
	siteSlug: string = window?.currentSiteId?.toString() || '',
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
