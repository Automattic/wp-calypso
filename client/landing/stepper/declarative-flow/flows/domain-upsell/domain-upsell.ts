import {
	OnboardActions,
	OnboardSelect,
	updateLaunchpadSettings,
	useLaunchpad,
} from '@automattic/data-stores';
import { addPlanToCart, addProductsToCart, DOMAIN_UPSELL_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArgs } from '@wordpress/url';
import { useRef } from 'react';
import { shouldRenderRewrittenDomainSearch } from 'calypso/lib/domains/should-render-rewritten-domain-search';
import { SIGNUP_DOMAIN_ORIGIN } from '../../../../../lib/analytics/signup';
import { useQuery } from '../../../hooks/use-query';
import { useSiteIdParam } from '../../../hooks/use-site-id-param';
import { useSiteSlug } from '../../../hooks/use-site-slug';
import { ONBOARD_STORE } from '../../../stores';
import { STEPS } from '../../internals/steps';
import { ProvidedDependencies } from '../../internals/types';
import type { Flow } from '../../internals/types';
import type { MinimalRequestCartProduct } from '@automattic/shopping-cart';

const isUsingRewrittenDomainSearch = shouldRenderRewrittenDomainSearch();

const DOMAIN_UPSELL_STEPS = [
	isUsingRewrittenDomainSearch ? STEPS.DOMAIN_SEARCH : STEPS.DOMAINS,
	STEPS.USE_MY_DOMAIN,
	STEPS.PLANS,
];

const domainUpsell: Flow = {
	name: DOMAIN_UPSELL_FLOW,
	isSignupFlow: false,

	useSteps() {
		return DOMAIN_UPSELL_STEPS;
	},

	useStepNavigation( currentStep, navigate ) {
		const backTo = useQuery().get( 'back_to' );
		const flowName = this.name;
		const siteSlug = useSiteSlug();
		const siteId = useSiteIdParam();
		const { getDomainCartItem, getPlanCartItem } = useSelect(
			( select ) => ( {
				getDomainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem,
				getPlanCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem,
			} ),
			[]
		);
		const { setDomainCartItem, setDomainCartItems, setSignupDomainOrigin, setHideFreePlan } =
			useDispatch( ONBOARD_STORE ) as OnboardActions;
		const { data: { launchpad_screen: launchpadScreenOption } = {} } = useLaunchpad( siteSlug );

		const returnUrl =
			launchpadScreenOption === 'skipped' || ! backTo ? `/home/${ siteSlug }` : backTo;
		const encodedReturnUrl = encodeURIComponent( returnUrl );

		const submittedDomains = useRef( false );

		function goBack() {
			if ( currentStep === 'domains' ) {
				return window.location.assign( returnUrl );
			}
			if ( currentStep === 'plans' ) {
				if ( ! submittedDomains.current ) {
					return window.location.assign( returnUrl );
				}

				navigate( 'domains' );
			}
		}

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case STEPS.DOMAINS.slug: {
					if ( ! isUsingRewrittenDomainSearch ) {
						if ( providedDependencies?.deferDomainSelection ) {
							try {
								const siteIdentifier = siteSlug || siteId;
								if ( siteIdentifier ) {
									await updateLaunchpadSettings( siteIdentifier, {
										checklist_statuses: { domain_upsell_deferred: true },
									} );
								}
							} catch ( error ) {}

							return window.location.assign( returnUrl );
						}

						setHideFreePlan( true );
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

					setHideFreePlan( true );

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
					if ( providedDependencies?.goToCheckout ) {
						const planCartItem = getPlanCartItem();
						const domainCartItem = getDomainCartItem();

						if ( planCartItem && siteSlug ) {
							await addPlanToCart( siteSlug, flowName, true, '', planCartItem );
						}

						if ( domainCartItem && siteSlug ) {
							await addProductsToCart( siteSlug, flowName, [ domainCartItem ] );
						}

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								siteSlug ?? ''
							) }?redirect_to=${ encodedReturnUrl }`
						);
					}
			}
		}

		return { submit, goBack };
	},
};

export default domainUpsell;
