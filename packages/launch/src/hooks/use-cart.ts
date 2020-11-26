/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE, SITE_STORE, PLANS_STORE } from '../stores';
import LaunchContext from '../context';
import { getPlanProduct, getDomainProduct } from '../utils';

export function useCart(): { goToCheckout: () => Promise< void > } {
	const { siteId, flow, openCheckout } = React.useContext( LaunchContext );

	const { plan, domain } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );
	const isEcommercePlan = useSelect( ( select ) =>
		select( PLANS_STORE ).isPlanEcommerce( plan?.storeSlug )
	);

	const { getCart, setCart } = useDispatch( SITE_STORE );

	const goToCheckout = async () => {
		// setting the cart with Launch products can be extracted
		// to an action creator on the Launch data-store
		const planProduct = plan && getPlanProduct( plan, flow );
		const domainProduct = domain && getDomainProduct( domain, flow );

		const cart = await getCart( siteId );
		await setCart( siteId, {
			...cart,
			products: [ planProduct, domainProduct ],
		} );

		// open checkout modal or redirect to /checkout only after the cart is updated
		openCheckout( siteId, isEcommercePlan );
	};

	return {
		goToCheckout,
	};
}
