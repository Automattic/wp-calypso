import { useCallback, useEffect } from '@wordpress/element';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { Status } from './constants';
import type { NewSiteBlogDetails, DomainSuggestion } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const isComingFromSenseiLMSSite = (): boolean => {
	const urlParams = new URLSearchParams( window.location.search );
	return urlParams.get( 'ref' ) === 'senseilms';
};

export const usePlanSelection = ( {
	flow,
	status,
	setStatus,
	domain,
	businessPlanSlug,
	senseiProPlanSlug,
	isLoadingPlans,
}: {
	flow: string;
	status: Status;
	setStatus: ( status: Status ) => void;
	domain: DomainSuggestion | undefined;
	businessPlanSlug: string;
	senseiProPlanSlug: string;
	isLoadingPlans: boolean;
} ) => {
	const progress = 0;

	const createCheckoutCart = useCallback(
		async ( site?: NewSiteBlogDetails ) => {
			const cartKey = await cartManagerClient.getCartKeyForSiteSlug( site?.site_slug ?? '' );

			const productsToAdd: MinimalRequestCartProduct[] = [
				{
					product_slug: businessPlanSlug,
					extra: {
						signup_flow: flow,
					},
				},
				{
					product_slug: senseiProPlanSlug,
					extra: {
						signup_flow: flow,
					},
				},
			];

			if ( domain && domain.product_slug ) {
				const registration = domainRegistration( {
					domain: domain.domain_name,
					productSlug: domain.product_slug,
					extra: { privacy_available: domain.supports_privacy },
				} );

				productsToAdd.push( registration );
			}

			await cartManagerClient.forCartKey( cartKey ).actions.addProductsToCart( productsToAdd );
			const redirectTo = encodeURIComponent(
				`/setup/sensei/senseiPurpose?siteSlug=${ site?.site_slug }&siteId=${ site?.blogid }`
			);

			return `/checkout/${ site?.site_slug }?signup=1&redirect_to=${ redirectTo }`;
		},
		[ businessPlanSlug, domain, flow, senseiProPlanSlug ]
	);

	const onPlanSelect = useCallback( async () => {
		try {
			setStatus( Status.Bundling );

			// Wait for a bit to get an animation in the beginning of site creation.
			await new Promise( ( res ) => setTimeout( res, 100 ) );

			const checkoutUrl = await createCheckoutCart( site );

			return window.location.assign( checkoutUrl );
		} catch ( err ) {
			setStatus( Status.Error );
		}
	}, [ setStatus, createCheckoutCart ] );

	// Auto-select YEARLY plan when coming from senseilms.com site.
	useEffect( () => {
		if ( ! isComingFromSenseiLMSSite() ) {
			return;
		}

		if ( status === Status.Initial ) {
			setStatus( Status.Bundling );
		}

		if ( ! isLoadingPlans ) {
			onPlanSelect();
		}
	}, [ isLoadingPlans, status, setStatus, onPlanSelect ] );

	return { progress, onPlanSelect };
};
