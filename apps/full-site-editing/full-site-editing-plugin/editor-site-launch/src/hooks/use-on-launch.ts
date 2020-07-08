/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { useSite } from './';
import { LAUNCH_STORE } from '../stores';

declare global {
	interface Window {
		_currentSiteId: number;
	}
}

export const useOnLaunch = () => {
	const { launchStatus } = useSite();
	const { plan } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );

	React.useEffect( () => {
		if ( launchStatus ) {
			if ( plan && ! plan?.isFree ) {
				console.log( 'set cart and then redirect to /checkout to purchase plan' ); //eslint-disable-line no-console
				//window.location.href = `https://wordpress.com/checkout/${ window._currentSiteId }?preLaunch=1&isGutenboardingCreate=1`;
				return;
			}
			window.location.href = `https://wordpress.com/home/${ window._currentSiteId }`;
		}
	}, [ launchStatus ] );
};
