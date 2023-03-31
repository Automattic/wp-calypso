import { useDispatch, useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { OnboardSelect } from 'calypso/../packages/data-stores/src';
import {
	addPlanToCart,
	addProductsToCart,
	DOMAIN_UPSELL_FLOW,
} from 'calypso/../packages/onboarding/src';
import { updateLaunchpadSettings } from 'calypso/data/sites/use-launchpad';
import { useQuery } from '../hooks/use-query';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import DomainsStep from './internals/steps-repository/domains';
import PlansStep from './internals/steps-repository/plans';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const domainUpsell: Flow = {
	name: DOMAIN_UPSELL_FLOW,
	get title() {
		return translate( 'Domain Upsell' );
	},

	useSteps() {
		return [
			{ slug: 'domains', component: DomainsStep },
			{ slug: 'plans', component: PlansStep },
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = useQuery().get( 'flowToReturnTo' );
		const siteSlug = useSiteSlug();
		const { getDomainCartItem, getPlanCartItem } = useSelect(
			( select ) => ( {
				getDomainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem,
				getPlanCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem,
			} ),
			[]
		);
		const { setHideFreePlan } = useDispatch( ONBOARD_STORE );

		const returnUrl = `/setup/${ flowName }/launchpad?siteSlug=${ siteSlug }`;
		const encodedReturnUrl = encodeURIComponent( returnUrl );

		const exitFlow = ( location = '/sites' ) => {
			window.location.assign( location );
		};

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case 'domains':
					if ( providedDependencies?.deferDomainSelection ) {
						try {
							await updateLaunchpadSettings( siteSlug, {
								launchpad_checklist_tasks_statuses: { domain_upsell_deferred: true },
							} );
						} catch ( error ) {}

						return window.location.assign( returnUrl );
					}
					setHideFreePlan( true );
					navigate( 'plans' );

				case 'plans':
					if ( providedDependencies?.returnToDomainSelection ) {
						return navigate( 'domains' );
					}
					if ( providedDependencies?.goToCheckout ) {
						const planCartItem = getPlanCartItem();
						const domainCartItem = getDomainCartItem();
						if ( planCartItem ) {
							await addPlanToCart( siteSlug as string, flowName as string, true, '', planCartItem );
						}

						if ( domainCartItem ) {
							await addProductsToCart( siteSlug as string, flowName as string, [ domainCartItem ] );
						}

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( siteSlug as string ) ?? ''
							) }?redirect_to=${ encodedReturnUrl }`
						);
					}
			}
		}

		return { submit, exitFlow };
	},
};

export default domainUpsell;
