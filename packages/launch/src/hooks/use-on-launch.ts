/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE, PLANS_STORE } from '../stores';
import LaunchContext from '../context';
import { useCart, useSiteDomains } from '../hooks';
import { useSite } from './';

// Hook used exclusively in Step-by-step launch flow until it will be using Editor Checkout Modal
export const useOnLaunch = () => {
	const { siteId, redirectTo } = React.useContext( LaunchContext );

	const { planProductId } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const isPlanFree = useSelect( ( select ) =>
		select( PLANS_STORE ).isPlanProductFree( planProductId )
	);

	const { isSiteLaunched } = useSite();
	const { siteSubdomain } = useSiteDomains();
	const { goToCheckout } = useCart();

	React.useEffect( () => {
		if ( isSiteLaunched ) {
			// if a paid plan is selected, set cart and redirect to /checkout
			if ( ! isPlanFree ) {
				goToCheckout();
				return;
			}
			// if free plan is selected, redirect to My Home
			redirectTo( `/home/${ siteSubdomain?.domain || siteId }` );
		}
	}, [ isSiteLaunched ] ); // eslint-disable-line react-hooks/exhaustive-deps
};
