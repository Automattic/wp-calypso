import { createRequestCartProduct } from '@automattic/shopping-cart';
import { isValueTruthy } from '@automattic/wpcom-checkout';
import { useDispatch, useSelect } from '@wordpress/data';
import { useMemo, useEffect } from 'react';
import { cartManagerClient } from 'calypso/my-sites/checkout/cart-manager-client';
import { recordOnboardingComplete } from '../lib/analytics';
import { clearLastNonEditorRoute } from '../lib/clear-last-non-editor-route';
import { useOnboardingFlow } from '../path';
import { STORE_KEY as ONBOARD_STORE } from '../stores/onboard';
import { PLANS_STORE } from '../stores/plans';
import { SITE_STORE } from '../stores/site';
import { USER_STORE } from '../stores/user';
import { useSelectedPlan, useShouldRedirectToEditorAfterCheckout } from './use-selected-plan';
import type { RequestCartProduct } from '@automattic/shopping-cart';

/**
 * After a new site has been created there are 3 scenarios to cover:
 * 1. The user explicitly selected a paid plan using PlansGrid => redirect to checkout with that plan + any selected paid domain in cart
 * 2. The user selected a paid domain using DomainPicker (Premium Plan appears in top-right corner) => show PlansGrid as the last step of Gutenboarding => scenario 1
 * 3. The user is still seeing 'Free Plan' label on PlansButton => redirect to editor
 */

export default function useOnSiteCreation(): void {
	const { domain } = useSelect( ( select ) => select( ONBOARD_STORE ).getState() );
	const isRedirecting = useSelect( ( select ) => select( ONBOARD_STORE ).getIsRedirecting() );
	const newSite = useSelect( ( select ) => select( SITE_STORE ).getNewSite() );
	const newUser = useSelect( ( select ) => select( USER_STORE ).getNewUser() );
	const selectedPlan = useSelectedPlan();
	const shouldRedirectToEditorAfterCheckout = useShouldRedirectToEditorAfterCheckout();
	const design = useSelect( ( select ) => select( ONBOARD_STORE ).getSelectedDesign() );
	const selectedPlanProductId = useSelect( ( select ) =>
		select( ONBOARD_STORE ).getPlanProductId()
	);
	const planProductSource = useSelect( ( select ) =>
		select( PLANS_STORE ).getPlanProductById( selectedPlanProductId )
	);

	const flow = useOnboardingFlow();

	const { resetOnboardStore, setIsRedirecting, setSelectedSite } = useDispatch( ONBOARD_STORE );
	const flowCompleteTrackingParams = useMemo(
		() => ( {
			isNewSite: !! newSite,
			isNewUser: !! newUser,
			blogId: newSite?.blogid,
			hasCartItems: false,
		} ),
		[ newSite, newUser ]
	);

	useEffect( () => {
		// isRedirecting check this is needed to make sure we don't overwrite the first window.location.replace() call
		if ( newSite && ! isRedirecting ) {
			setIsRedirecting( true );

			if ( selectedPlan && ! selectedPlan?.isFree && planProductSource ) {
				const planProduct: RequestCartProduct = createRequestCartProduct( {
					product_id: planProductSource.productId,
					product_slug: planProductSource.storeSlug,
					extra: {
						source: 'gutenboarding',
					},
				} );

				let domainProduct: RequestCartProduct | null = null;
				if ( domain?.product_id && domain?.product_slug ) {
					domainProduct = createRequestCartProduct( {
						meta: domain.domain_name,
						product_id: domain.product_id,
						product_slug: domain.product_slug,
						extra: {
							privacy: domain.supports_privacy,
							source: 'gutenboarding',
						},
					} );
				}

				const go = async () => {
					if ( planProduct || domainProduct ) {
						await cartManagerClient
							.forCartKey( String( newSite.blogid ) )
							.actions.addProductsToCart( [ planProduct, domainProduct ].filter( isValueTruthy ) );
					}
					resetOnboardStore();
					clearLastNonEditorRoute();
					setSelectedSite( newSite.blogid );

					const editorUrl = design?.is_fse
						? `site-editor%2F${ newSite.site_slug }`
						: `block-editor%2Fpage%2F${ newSite.site_slug }%2Fhome`;

					const redirectionUrl = shouldRedirectToEditorAfterCheckout
						? `/checkout/${ newSite.site_slug }?redirect_to=%2F${ editorUrl }`
						: `/checkout/${ newSite.site_slug }`;
					window.location.href = redirectionUrl;
				};
				recordOnboardingComplete( {
					...flowCompleteTrackingParams,
					hasCartItems: true,
					flow,
				} );
				go();
				return;
			}
			recordOnboardingComplete( {
				...flowCompleteTrackingParams,
				flow,
			} );
			resetOnboardStore();
			clearLastNonEditorRoute();
			setSelectedSite( newSite.blogid );

			window.location.href = `/home/${ newSite.site_slug }/`;
		}
	}, [
		flow,
		planProductSource,
		domain,
		selectedPlan,
		isRedirecting,
		newSite,
		newUser,
		resetOnboardStore,
		setIsRedirecting,
		setSelectedSite,
		flowCompleteTrackingParams,
		shouldRedirectToEditorAfterCheckout,
		design,
	] );
}
