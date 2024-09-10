import { useSelect } from '@wordpress/data';
import { useCallback, useEffect } from '@wordpress/element';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { setSignupCompleteFlowName } from 'calypso/signup/storageUtils';
import { Status } from './constants';
import { useCreateSenseiSite } from './create-sensei-site';
import type { NewSiteBlogDetails, DomainSuggestion, OnboardSelect } from '@automattic/data-stores';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import type { PlanBillingPeriod } from 'calypso/../packages/data-stores';

export const getDefaultPlan = (): PlanBillingPeriod | undefined => {
	const billingPeriodOptions = [ 'MONTHLY', 'ANNUALLY' ];

	const urlParams = new URLSearchParams( window.location.search );
	const plan = urlParams.get( 'plan' ) ?? '';

	if ( billingPeriodOptions.includes( plan ) ) {
		return plan as PlanBillingPeriod;
	}

	return undefined;
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
	const { createAndConfigureSite, progress } = useCreateSenseiSite();
	const { getSelectedStyleVariation } = useSelect(
		( select ) => select( ONBOARD_STORE ) as OnboardSelect,
		[]
	);

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

			setSignupCompleteFlowName( flow );

			await cartManagerClient.forCartKey( cartKey ).actions.addProductsToCart( productsToAdd );

			const styleVariation = getSelectedStyleVariation()?.title ?? 'Green';
			const redirectTo = encodeURIComponent(
				`/setup/sensei/senseiPurpose?siteSlug=${ site?.site_slug }&siteId=${ site?.blogid }&variation=${ styleVariation }`
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

			const { site } = await createAndConfigureSite();
			const checkoutUrl = await createCheckoutCart( site );

			return window.location.assign( checkoutUrl );
		} catch ( err ) {
			setStatus( Status.Error );
		}
	}, [ setStatus, createAndConfigureSite, createCheckoutCart ] );

	// Auto-select YEARLY plan when coming from senseilms.com site.
	useEffect( () => {
		if ( undefined === getDefaultPlan() || status === Status.Error ) {
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
