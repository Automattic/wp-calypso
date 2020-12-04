/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE } from '../stores';
import LaunchContext from '../context';
import { useCart } from '../hooks';
import { useSite } from './';

// Hook used exclusively in Step-by-step launch flow until it will be using Editor Checkout Modal
export const useOnLaunch = () => {
	const { siteId, redirectTo } = React.useContext( LaunchContext );

	const { plan } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );

	const { isSiteLaunched } = useSite();
	const { goToCheckout } = useCart();

	React.useEffect( () => {
		if ( isSiteLaunched ) {
			// if a paid plan is selected, set cart and redirect to /checkout
			if ( plan && ! plan?.isFree ) {
				goToCheckout();
				return;
			}
			// if free plan is selected, redirect to My Home
			redirectTo( `/home/${ siteId }` );
		}
	}, [ isSiteLaunched ] ); // eslint-disable-line react-hooks/exhaustive-deps
};
