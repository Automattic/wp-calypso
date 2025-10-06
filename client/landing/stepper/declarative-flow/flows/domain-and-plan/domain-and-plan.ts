import {
	OnboardActions,
	OnboardSelect,
	updateLaunchpadSettings,
	useLaunchpad,
} from '@automattic/data-stores';
import { addPlanToCart, addProductsToCart, DOMAIN_AND_PLAN_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArgs } from '@wordpress/url';
import { useEffect, useRef } from 'react';
import { shouldRenderRewrittenDomainSearch } from 'calypso/lib/domains/should-render-rewritten-domain-search';
import { SIGNUP_DOMAIN_ORIGIN } from '../../../../../lib/analytics/signup';
import { useQuery } from '../../../hooks/use-query';
import { useSiteSlug } from '../../../hooks/use-site-slug';
import { ONBOARD_STORE } from '../../../stores';
import { STEPS } from '../../internals/steps';
import { AssertConditionState, ProvidedDependencies } from '../../internals/types';
import type { Flow } from '../../internals/types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const isUsingRewrittenDomainSearch = shouldRenderRewrittenDomainSearch();

const DOMAIN_UPSELL_STEPS = [
	isUsingRewrittenDomainSearch ? STEPS.DOMAIN_SEARCH : STEPS.DOMAINS,
	STEPS.USE_MY_DOMAIN,
	STEPS.PLANS,
];

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
		const { getDomainCartItem, getPlanCartItem } = useSelect(
			( select ) => ( {
				getDomainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem,
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

		function goBack() {
			if ( currentStep === STEPS.DOMAINS.slug ) {
				return window.location.assign( returnUrl );
			}
			if ( currentStep === STEPS.PLANS.slug ) {
				if ( ! submittedDomains.current ) {
					return window.location.assign( returnUrl );
				}

				return navigate( STEPS.DOMAINS.slug );
			}

			if ( currentStep === STEPS.USE_MY_DOMAIN.slug ) {
				return navigate( STEPS.DOMAINS.slug );
			}

			throw new Error( `Step back button not handled: ${ currentStep }` );
		}

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case STEPS.DOMAINS.slug: {
					if ( ! isUsingRewrittenDomainSearch ) {
						if ( providedDependencies?.deferDomainSelection ) {
							try {
								if ( siteSlug ) {
									await updateLaunchpadSettings( siteSlug, {
										checklist_statuses: { domain_upsell_deferred: true },
									} );
								}
							} catch ( error ) {}

							return window.location.assign( returnUrl );
						}

						submittedDomains.current = true;
						navigate( STEPS.PLANS.slug );
						return;
					}

					if ( providedDependencies.navigateToUseMyDomain ) {
						const currentQueryArgs = getQueryArgs( window.location.href );
						currentQueryArgs.step = 'domain-input';

						let useMyDomainURL = addQueryArgs( '/use-my-domain', currentQueryArgs );

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
						const destination = addQueryArgs( '/use-my-domain', {
							...getQueryArgs( window.location.href ),
							step: providedDependencies.mode,
							initialQuery: providedDependencies.domain,
						} );
						return navigate( destination as typeof currentStep );
					}

					submittedDomains.current = true;

					return navigate( STEPS.PLANS.slug );
				}
				case STEPS.PLANS.slug:
					await updateLaunchpadSettings( siteSlug, {
						checklist_statuses: { plan_completed: true },
					} );

					if ( providedDependencies?.goToCheckout ) {
						const planCartItem = getPlanCartItem();
						const domainCartItem = getDomainCartItem();

						if ( planCartItem ) {
							await addPlanToCart( siteSlug, flowName, true, '', planCartItem );
						}

						if ( domainCartItem ) {
							await addProductsToCart( siteSlug, flowName, [ domainCartItem ] );
						}

						return window.location.assign(
							`/checkout/${ siteSlug }?redirect_to=${ encodeURIComponent( returnUrl ) }`
						);
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
