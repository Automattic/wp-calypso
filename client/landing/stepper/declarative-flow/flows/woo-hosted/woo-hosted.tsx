import { WOO_HOSTED_FLOW, addPlanToCart, addProductsToCart } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArgs } from '@wordpress/url';
import { useEffect, useRef } from 'react';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { useQuery } from '../../../hooks/use-query';
import { useSiteSlug } from '../../../hooks/use-site-slug';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { AssertConditionState, ProvidedDependencies } from '../../internals/types';
import type { FlowV2 } from '../../internals/types';
import type { DomainSuggestion } from '@automattic/api-core';
import type { OnboardActions, OnboardSelect } from '@automattic/data-stores';
import './style.scss';

function initialize() {
	const steps = [ STEPS.DOMAIN_SEARCH, STEPS.USE_MY_DOMAIN, STEPS.UNIFIED_PLANS ];

	return stepsWithRequiredLogin( steps );
}

const wooHosted: FlowV2< typeof initialize > = {
	name: WOO_HOSTED_FLOW,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: false,
	initialize,

	useStepsProps() {
		return {
			[ STEPS.UNIFIED_PLANS.slug ]: {
				//isInSignup: false,
				displayedIntervals: [ 'monthly', 'yearly' ],
			},
		};
	},

	useStepNavigation( currentStep, navigate ) {
		const backTo = useQuery().get( 'back_to' );
		const flowName = this.name;
		const siteSlug = useSiteSlug()!;
		const { getDomainCartItem } = useSelect(
			( select ) => ( {
				getDomainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem,
			} ),
			[]
		);
		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setProductCartItems,
			setSignupDomainOrigin,
			setSiteUrl,
			setHideFreePlan,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;

		const returnUrl = backTo || `/sites/${ siteSlug }`;

		const submittedDomains = useRef( false );

		function goBack() {
			if ( currentStep === STEPS.DOMAIN_SEARCH.slug ) {
				return window.location.assign( returnUrl );
			}

			if ( currentStep === STEPS.UNIFIED_PLANS.slug ) {
				if ( ! submittedDomains.current ) {
					return window.location.assign( returnUrl );
				}

				return navigate( STEPS.DOMAIN_SEARCH.slug );
			}

			if ( currentStep === STEPS.USE_MY_DOMAIN.slug ) {
				return navigate( STEPS.DOMAIN_SEARCH.slug );
			}

			return window.location.assign( returnUrl );
		}

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case STEPS.DOMAIN_SEARCH.slug: {
					if ( ! providedDependencies ) {
						throw new Error( 'No provided dependencies found' );
					}

					if ( providedDependencies.navigateToUseMyDomain ) {
						const currentQueryArgs = getQueryArgs( window.location.href );

						const useMyDomainURL = addQueryArgs( 'use-my-domain', {
							...currentQueryArgs,
							initialQuery: providedDependencies.lastQuery,
						} );

						return navigate( useMyDomainURL as typeof currentStep );
					}

					submittedDomains.current = true;

					const suggestion = providedDependencies.suggestion as DomainSuggestion;

					setSiteUrl( providedDependencies.siteUrl as string );
					setDomain( suggestion );
					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );
					setHideFreePlan( true );

					return navigate( STEPS.UNIFIED_PLANS.slug );
				}
				case STEPS.USE_MY_DOMAIN.slug: {
					setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );

					if (
						providedDependencies &&
						'mode' in providedDependencies &&
						providedDependencies.mode &&
						providedDependencies.domain
					) {
						const destination = addQueryArgs( '/use-my-domain', {
							...getQueryArgs( window.location.href ),
							step: providedDependencies.mode,
							initialQuery: providedDependencies.domain,
						} );
						return navigate( destination as typeof currentStep );
					}

					if ( providedDependencies && 'domainCartItem' in providedDependencies ) {
						setHideFreePlan( true );
						setDomainCartItem( providedDependencies.domainCartItem as MinimalRequestCartProduct );
					}

					submittedDomains.current = true;

					return navigate( STEPS.UNIFIED_PLANS.slug );
				}
				case STEPS.UNIFIED_PLANS.slug: {
					const cartItems = providedDependencies.cartItems;
					const [ pickedPlan, ...products ] = cartItems ?? [];

					// Save plan and products to the store for future reference
					setPlanCartItem( pickedPlan );
					setProductCartItems( products.filter( ( product ) => product !== null ) );

					// Add plan to cart if one was selected
					if ( pickedPlan ) {
						await addPlanToCart( siteSlug, flowName, true, '', pickedPlan );
					}

					// Get domain from store (set in domains step) and add to cart
					const domainCartItem = getDomainCartItem();
					if ( domainCartItem ) {
						await addProductsToCart( siteSlug, flowName, [ domainCartItem ] );
					}

					return window.location.assign(
						`/checkout/${ siteSlug }?redirect_to=${ encodeURIComponent( returnUrl ) }`
					);
				}
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
	useSideEffect( currentStepSlug ) {
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE ) as OnboardActions;

		/**
		 * Clears the onboard store when entering the flow.
		 * This ensures the user starts with a clean slate.
		 */
		useEffect( () => {
			if ( ! currentStepSlug ) {
				resetOnboardStore();
			}
		}, [ currentStepSlug, resetOnboardStore ] );
	},
};

export default wooHosted;
