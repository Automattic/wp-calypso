import { OnboardSelect, updateLaunchpadSettings, useLaunchpad } from '@automattic/data-stores';
import { addPlanToCart, addProductsToCart, DOMAIN_UPSELL_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useQuery } from '../hooks/use-query';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import { STEPS } from './internals/steps';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const DOMAIN_UPSELL_STEPS = [ STEPS.DOMAINS, STEPS.PLANS ];

const domainUpsell: Flow = {
	name: DOMAIN_UPSELL_FLOW,
	get title() {
		return translate( 'Domain Upsell' );
	},
	isSignupFlow: false,

	useSteps() {
		return DOMAIN_UPSELL_STEPS;
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = useQuery().get( 'flowToReturnTo' );
		const siteSlug = useSiteSlug();
		const siteId = useSiteIdParam();
		const { getDomainCartItem, getPlanCartItem } = useSelect(
			( select ) => ( {
				getDomainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem,
				getPlanCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem,
			} ),
			[]
		);
		const { setHideFreePlan } = useDispatch( ONBOARD_STORE );
		const { data: { launchpad_screen: launchpadScreenOption } = {} } = useLaunchpad( siteSlug );

		const returnUrl =
			launchpadScreenOption === 'skipped'
				? `/home/${ siteSlug }`
				: `/setup/${ flowName ?? 'free' }/launchpad?siteSlug=${ siteSlug }`;
		const encodedReturnUrl = encodeURIComponent( returnUrl );

		function goBack() {
			if ( currentStep === 'domains' ) {
				return window.location.assign( returnUrl );
			}
			if ( currentStep === 'plans' ) {
				navigate( 'domains' );
			}
		}

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case 'domains':
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
					navigate( 'plans' );

				case 'plans':
					if ( providedDependencies?.goToCheckout ) {
						const planCartItem = getPlanCartItem();
						const domainCartItem = getDomainCartItem();
						if ( planCartItem && siteSlug && flowName ) {
							await addPlanToCart( siteSlug, flowName, true, '', planCartItem );
						}

						if ( domainCartItem && siteSlug && flowName ) {
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
