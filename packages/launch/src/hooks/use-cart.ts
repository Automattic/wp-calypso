/**
 * External dependencies
 */
import * as React from 'react';
import { useSelect, useDispatch } from '@wordpress/data';
import { useLocale } from '@automattic/i18n-utils';

/**
 * Internal dependencies
 */
import { LAUNCH_STORE, SITE_STORE, PLANS_STORE } from '../stores';
import LaunchContext from '../context';
import { getDomainProduct, getPlanProductForFlow } from '../utils';
import { useSiteDomains } from '../hooks';

export function useCart(): {
	goToCheckout: () => Promise< void >; // used in gutenboarding-launch
	goToCheckoutAndLaunch: () => Promise< void >; // used in focused-launch integrated with Editor Checkout modal
	isCartUpdating: boolean;
} {
	const { siteId, flow, openCheckout, isInIframe } = React.useContext( LaunchContext );

	const locale = useLocale();

	const [ planProductId, domain ] = useSelect( ( select ) => [
		select( LAUNCH_STORE ).getSelectedPlanProductId(),
		select( LAUNCH_STORE ).getSelectedDomain(),
	] );

	const { planProduct, isEcommercePlan } = useSelect(
		( select ) => {
			const plan = select( PLANS_STORE ).getPlanByProductId( planProductId, locale );
			return {
				planProduct: select( PLANS_STORE ).getPlanProductById( planProductId as number ),
				isEcommercePlan: select( PLANS_STORE ).isPlanEcommerce( plan?.periodAgnosticSlug ),
			};
		},
		[ planProductId, locale ]
	);

	const { siteSubdomain } = useSiteDomains();

	const { getCart, setCart, launchSite } = useDispatch( SITE_STORE );

	const onSuccess = () => launchSite( siteId );

	const [ isCartUpdating, setIsCartUpdating ] = React.useState( false );

	const addProductsToCart = async () => {
		if ( isCartUpdating ) {
			return;
		}

		setIsCartUpdating( true );

		// @TODO: setting the cart with Launch products can be extracted to an action creator on the Launch store
		const domainProductForFlow = domain && getDomainProduct( domain, flow );
		const planProductForFlow = planProduct && getPlanProductForFlow( planProduct, flow );
		const cart = await getCart( siteId );
		await setCart( siteId, {
			...cart,
			// replace any existing products from cart
			products: [ planProductForFlow, domainProductForFlow ],
		} );

		setIsCartUpdating( false );
	};

	const goToCheckout = async () => {
		await addProductsToCart();
		openCheckout( siteSubdomain?.domain, isEcommercePlan, onSuccess );
	};

	const goToCheckoutAndLaunch = async () => {
		if ( ! isInIframe ) {
			// if Focused Launch is loaded outside Calypso iframe (in wp-admin), we launch the site and then redirect to /checkout
			await launchSite( siteId );
		}
		goToCheckout();
	};

	return {
		goToCheckout,
		goToCheckoutAndLaunch,
		isCartUpdating,
	};
}
