/**
 * External dependencies
 */
import * as React from 'react';
import { addQueryArgs } from '@wordpress/url';

export interface LaunchContextProps {
	siteId: number;
	redirectTo: ( url: string ) => void;
	openCheckout: (
		siteSlug?: string,
		isEcommerce?: boolean,
		onSuccessCallback?: () => void
	) => void;
	getCurrentLaunchFlowUrl: () => string;
	flow: string;
	isInIframe: boolean;
}

const defaultRedirectTo = ( url: string ) => {
	// Won't work if trying to redirect the parent frame
	window.location.href = url;
};

const defaultCurrentLaunchFlowUrl = (): string => window.location.href;

const LaunchContext = React.createContext< LaunchContextProps >( {
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
	isInIframe: false,
} );

export default LaunchContext;
