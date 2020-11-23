/**
 * External dependencies
 */
import * as React from 'react';
import { addQueryArgs } from '@wordpress/url';

interface LaunchContext {
	siteId: number;
	locale: string;
	redirectTo: ( url: string ) => void;
	openCheckout: ( siteId: number | string, isEcommerce?: boolean ) => void;
	flow: string;
}

const LaunchContext = React.createContext< LaunchContext >( {
	siteId: 0,
	locale: 'en',
	redirectTo: ( url: string ) => {
		// Won't work if trying to redirect the parent frame
		window.location.href = url;
	},
	openCheckout: ( siteId, isEcommerce ) => {
		window.top.location.href = addQueryArgs( `https://wordpress.com/checkout/${ siteId }`, {
			preLaunch: 1,
			// Redirect to My Home after checkout only if the selected plan is not eCommerce
			...( ! isEcommerce && { redirect_to: `/home/${ siteId }` } ),
		} );
	},
	flow: 'launch',
} );

export default LaunchContext;
