import { DomainProductSlugs, DotcomFeatures } from '@automattic/api-core';
import {
	OnboardActions,
	OnboardSelect,
	updateLaunchpadSettings,
	useLaunchpad,
} from '@automattic/data-stores';
import { addProductsToCart, DOMAIN_AND_PLAN_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArgs } from '@wordpress/url';
import { useEffect, useRef } from 'react';
import { hasPlanFeature } from 'calypso/dashboard/utils/site-features';
import wpcom from 'calypso/lib/wp';
import { domainMappingSetup } from 'calypso/my-sites/domains/paths';
import { SIGNUP_DOMAIN_ORIGIN } from '../../../../../lib/analytics/signup';
import { useQuery } from '../../../hooks/use-query';
import { useSite } from '../../../hooks/use-site';
import { useSiteSlug } from '../../../hooks/use-site-slug';
import { ONBOARD_STORE } from '../../../stores';
import { STEPS } from '../../internals/steps';
import { AssertConditionState, ProvidedDependencies } from '../../internals/types';
import type { Flow } from '../../internals/types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const DOMAIN_UPSELL_STEPS = [ STEPS.DOMAIN_SEARCH, STEPS.USE_MY_DOMAIN, STEPS.PLANS ];

const domainUpsell: Flow = {
	name: DOMAIN_AND_PLAN_FLOW,
	isSignupFlow: false,

	useSteps() {
		return DOMAIN_UPSELL_STEPS;
	},

	useStepNavigation( currentStep, navigate ) {
		const backTo = useQuery().get( 'back_to' );
		const flowName = this.name;
		const siteSlug = useSiteSlug()!;
		const site = useSite();
		const hasQualifyingPlan =
			!! site?.plan && ! site.plan.is_free && site.plan.billing_period !== 'Monthly';
		// Connecting a domain is bundled with every paid plan, so there is nothing left to buy.
		const mappingIsIncludedInPlan =
			!! site &&
			( ( !! site.plan && ! site.plan.is_free ) ||
				hasPlanFeature( site, DotcomFeatures.DOMAIN_MAPPING ) );
		const domainConnectionSetupUrl = useQuery().get( 'domainConnectionSetupUrl' );
		const { getDomainCartItems, getPlanCartItem } = useSelect(
			( select ) => ( {
				getDomainCartItems: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItems,
				getPlanCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem,
			} ),
			[]
		);
		const { setDomainCartItem, setDomainCartItems, setSignupDomainOrigin } = useDispatch(
			ONBOARD_STORE
		) as OnboardActions;
		const { data: { launchpad_screen: launchpadScreenOption } = {} } = useLaunchpad( siteSlug );

		const returnUrl =
			launchpadScreenOption === 'skipped' || ! backTo ? `/home/${ siteSlug }` : backTo;

		const submittedDomains = useRef( false );

		function getDomainConnectionSetupUrl( domain: string ) {
			return domainConnectionSetupUrl
				? domainConnectionSetupUrl.replace( '%s', domain )
				: domainMappingSetup( siteSlug, domain, '', false, true );
		}

		function getPostCheckoutUrl( domainCartItems: MinimalRequestCartProduct[] ) {
			// A connected domain still has to be pointed at the site once it is paid for, so
			// finish on the setup instructions rather than wherever the user came from. More
			// than one domain in the cart makes the destination ambiguous, so leave it alone.
			if ( domainCartItems.length !== 1 ) {
				return returnUrl;
			}

			const [ domainCartItem ] = domainCartItems;
			const domain = domainCartItem.meta;

			if ( domainCartItem.product_slug !== DomainProductSlugs.DOMAIN_MAPPING || ! domain ) {
				return returnUrl;
			}

			return getDomainConnectionSetupUrl( domain );
		}

		async function addToCartAndRedirectToCheckout( { includePlan = true } = {} ) {
			const planCartItem = getPlanCartItem();
			const domainCartItems = getDomainCartItems() ?? [];

			const cartItems = [
				...( includePlan && planCartItem ? [ planCartItem ] : [] ),
				...domainCartItems,
			];

			if ( cartItems.length > 0 ) {
				await addProductsToCart( siteSlug, flowName, cartItems );
			}

			return window.location.assign(
				`/checkout/${ siteSlug }?redirect_to=${ encodeURIComponent(
					getPostCheckoutUrl( domainCartItems )
				) }`
			);
		}

		function goBack() {
			if ( currentStep === STEPS.DOMAIN_SEARCH.slug ) {
				return window.location.assign( returnUrl );
			}
			if ( currentStep === STEPS.PLANS.slug ) {
				if ( ! submittedDomains.current ) {
					return window.location.assign( returnUrl );
				}

				return navigate( STEPS.DOMAIN_SEARCH.slug );
			}

			if ( currentStep === STEPS.USE_MY_DOMAIN.slug ) {
				return navigate( STEPS.DOMAIN_SEARCH.slug );
			}

			throw new Error( `Step back button not handled: ${ currentStep }` );
		}

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case STEPS.DOMAIN_SEARCH.slug: {
					if ( providedDependencies.navigateToUseMyDomain ) {
						const currentQueryArgs = getQueryArgs( window.location.href );
						currentQueryArgs.step = 'domain-input';

						let useMyDomainURL = addQueryArgs( 'use-my-domain', currentQueryArgs );

						const lastQueryParam = providedDependencies.lastQuery as string | undefined;

						if ( lastQueryParam !== undefined ) {
							currentQueryArgs.initialQuery = lastQueryParam;
							useMyDomainURL = addQueryArgs( useMyDomainURL, currentQueryArgs );
						}

						return navigate( useMyDomainURL as typeof currentStep );
					}

					submittedDomains.current = true;

					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );

					if ( hasQualifyingPlan ) {
						return addToCartAndRedirectToCheckout( { includePlan: false } );
					}

					return navigate( STEPS.PLANS.slug );
				}
				case STEPS.USE_MY_DOMAIN.slug: {
					setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );

					if (
						providedDependencies &&
						'mode' in providedDependencies &&
						providedDependencies.mode &&
						providedDependencies.domain
					) {
						const destination = addQueryArgs( 'use-my-domain', {
							...getQueryArgs( window.location.href ),
							step: providedDependencies.mode,
							initialQuery: providedDependencies.domain,
						} );
						return navigate( destination as typeof currentStep );
					}

					// The step verified domain ownership and created the mapping itself, so all
					// that is left is to walk the user through pointing the domain at the site.
					if (
						'ownershipVerificationCompleted' in providedDependencies &&
						providedDependencies.domain
					) {
						submittedDomains.current = true;

						return window.location.assign(
							getDomainConnectionSetupUrl( providedDependencies.domain as string )
						);
					}

					// The domain can only be connected once the user has bought a plan.
					if ( 'skipToPlan' in providedDependencies ) {
						return navigate( STEPS.PLANS.slug );
					}

					submittedDomains.current = true;

					const domainCartItem = providedDependencies.domainCartItem as
						| MinimalRequestCartProduct
						| undefined;

					if ( ! domainCartItem ) {
						return navigate( STEPS.PLANS.slug );
					}

					// Nothing to charge for: connect the domain right away and send the user to the
					// setup instructions rather than through an empty checkout.
					if (
						site &&
						mappingIsIncludedInPlan &&
						domainCartItem.product_slug === DomainProductSlugs.DOMAIN_MAPPING
					) {
						const domain = domainCartItem.meta as string;

						try {
							await wpcom.req.post( `/sites/${ site.ID }/add-domain-mapping`, { domain } );

							return window.location.assign( getDomainConnectionSetupUrl( domain ) );
						} catch {
							// Fall through to checkout, which can process the mapping as well.
						}
					}

					setDomainCartItem( domainCartItem );
					setDomainCartItems( [ domainCartItem ] );

					if ( hasQualifyingPlan ) {
						return addToCartAndRedirectToCheckout( { includePlan: false } );
					}

					return navigate( STEPS.PLANS.slug );
				}
				case STEPS.PLANS.slug:
					await updateLaunchpadSettings( siteSlug, {
						checklist_statuses: { plan_completed: true },
					} );

					if ( providedDependencies?.goToCheckout ) {
						return addToCartAndRedirectToCheckout();
					}

					return window.location.assign( returnUrl );
			}
		}

		return { submit, goBack };
	},
	useAssertConditions() {
		const siteSlug = useSiteSlug();

		if ( ! siteSlug ) {
			window.location.assign( '/sites' );
			return { state: AssertConditionState.FAILURE, message: 'siteSlug is required' };
		}

		return { state: AssertConditionState.SUCCESS };
	},
	useSideEffect() {
		const { setHideFreePlan } = useDispatch( ONBOARD_STORE ) as OnboardActions;

		useEffect( () => {
			setHideFreePlan( true );
		}, [ setHideFreePlan ] );
	},
};

export default domainUpsell;
