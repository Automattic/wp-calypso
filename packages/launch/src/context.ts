/**
 * External dependencies
 */
import * as React from 'react';
import { addQueryArgs } from '@wordpress/url';

interface LaunchContext {
	siteId: number;
	redirectTo: ( url: string ) => void;
	openCheckout: ( siteSlug: string, isEcommerce?: boolean ) => void;
	getCurrentLaunchFlowUrl: () => string | undefined;
	flow: string;
}

const defaultRedirectTo = ( url: string ) => {
	// Won't work if trying to redirect the parent frame
	window.location.href = url;
};

const defaultCurrentLaunchFlowUrl = (): string | undefined => {
	try {
		return window.location.href;
	} catch ( err ) {
		return undefined;
	}
};

const LaunchContext = React.createContext< LaunchContext >( {
	siteId: 0,
	redirectTo: defaultRedirectTo,
	getCurrentLaunchFlowUrl: defaultCurrentLaunchFlowUrl,
	openCheckout: ( siteSlug, isEcommerce ) => {
		defaultRedirectTo(
			addQueryArgs( `/checkout/${ siteSlug }`, {
				preLaunch: 1,
				// Redirect to My Home after checkout only if the selected plan is not eCommerce
				...( ! isEcommerce && { redirect_to: `/home/${ siteSlug }` } ),
			} )
		);
	},
	flow: 'launch',
} );

export default LaunchContext;
