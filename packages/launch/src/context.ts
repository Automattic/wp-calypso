/**
 * External dependencies
 */
import * as React from 'react';
import { addQueryArgs } from '@wordpress/url';

interface LaunchContext {
	siteId: number;
	locale: string;
	redirectTo: ( url: string ) => void;
	openCheckout: ( siteId: number, isEcommerce?: boolean ) => void;
	flow: string;
}

const defaultRedirectTo = ( url: string ) => {
	// Won't work if trying to redirect the parent frame
	window.location.href = url;
};

const LaunchContext = React.createContext< LaunchContext >( {
	siteId: 0,
	locale: 'en',
	redirectTo: defaultRedirectTo,
	openCheckout: ( siteId, isEcommerce ) => {
		defaultRedirectTo(
			addQueryArgs( `/checkout/${ siteId }`, {
				preLaunch: 1,
				// Redirect to My Home after checkout only if the selected plan is not eCommerce
				...( ! isEcommerce && { redirect_to: `/home/${ siteId }` } ),
			} )
		);
	},
	flow: 'launch',
} );

export default LaunchContext;
