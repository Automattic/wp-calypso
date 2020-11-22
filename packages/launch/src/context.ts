/**
 * External dependencies
 */
import * as React from 'react';

interface LaunchContext {
	siteId: number;
	locale: string;
	redirectTo: ( url: string ) => void;
}

const LaunchContext = React.createContext< LaunchContext >( {
	siteId: 0,
	locale: 'en',
	redirectTo: ( url: string ) => {
		// Won't work if trying to redirect the parent frame
		window.location.href = url;
	},
} );

export default LaunchContext;
