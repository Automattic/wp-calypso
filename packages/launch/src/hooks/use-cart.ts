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
import { getDomainProduct, getPlanProductForFlow } from '../utils';
import { useSiteDomains } from '../hooks';

export function useCart(): { goToCheckout: () => Promise< void > } {
	const { siteId, flow, openCheckout } = React.useContext( LaunchContext );

	const { planProductId, domain } = useSelect( ( select ) => select( LAUNCH_STORE ).getState() );

	const planProduct = useSelect( ( select ) =>
		select( PLANS_STORE ).getPlanProductById( planProductId as number )
	);

	const plan = useSelect( ( select ) => select( PLANS_STORE ).getPlanByProductId( planProductId ) );

	const isEcommercePlan = useSelect( ( select ) =>
		select( PLANS_STORE ).isPlanEcommerce( plan?.periodAgnosticSlug )
	);

	const { siteSubdomain } = useSiteDomains();

	const { getCart, setCart } = useDispatch( SITE_STORE );

	const goToCheckout = async () => {
		// setting the cart with Launch products can be extracted
		// to an action creator on the Launch data-store
		const domainProductForFlow = domain && getDomainProduct( domain, flow );
		const planProductForFlow = planProduct && getPlanProductForFlow( planProduct, flow );

		const cart = await getCart( siteId );
		await setCart( siteId, {
			...cart,
			products: [ planProductForFlow, domainProductForFlow ],
		} );

		// open checkout modal or redirect to /checkout only after the cart is updated
		openCheckout( siteSubdomain?.domain || siteId.toString(), isEcommercePlan );
	};

	return {
		goToCheckout,
	};
}
