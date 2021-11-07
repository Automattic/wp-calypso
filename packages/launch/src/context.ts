import { addQueryArgs } from '@wordpress/url';
import { createContext } from 'react';

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

const LaunchContext = createContext< LaunchContextProps >( {
	siteId: 0,
	redirectTo: defaultRedirectTo,
	getCurrentLaunchFlowUrl: defaultCurrentLaunchFlowUrl,
	openCheckout: ( siteSlug, isEcommerce ) => {
		defaultRedirectTo(
			addQueryArgs( `/checkout/${ siteSlug }`, {
				// Redirect to My Home after checkout only if the selected plan is not eCommerce
				...( ! isEcommerce && { redirect_to: `/home/${ siteSlug }` } ),
			} )
		);
	},
	flow: 'launch',
	isInIframe: false,
} );

export default LaunchContext;
