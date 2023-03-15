import { useDispatch, useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import {
	addPlanToCart,
	addProductsToCart,
	DOMAIN_UPSELL_FLOW,
} from 'calypso/../packages/onboarding/src';
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
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );

		useEffect( () => {
			resetOnboardStore();
		}, [] );

		return [
			{ slug: 'domains', component: DomainsStep },
			{ slug: 'plans', component: PlansStep },
		];
	},

	useStepNavigation( currentStep, navigate ) {
		const flowName = useQuery().get( 'flowToReturnTo' );
		const siteSlug = useSiteSlug();
		const { getDomainCartItem, getPlanCartItem } = useSelect( ( select ) => ( {
			getDomainCartItem: select( ONBOARD_STORE ).getDomainCartItem,
			getPlanCartItem: select( ONBOARD_STORE ).getPlanCartItem,
		} ) );

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( currentStep ) {
				case 'domains':
					navigate( 'plans' );

				case 'plans':
					if ( providedDependencies?.goToCheckout ) {
						const planCartItem = getPlanCartItem();
						const domainCartItem = getDomainCartItem();
						if ( planCartItem ) {
							await addPlanToCart( siteSlug as string, flowName as string, true, '', planCartItem );
						}

						if ( domainCartItem ) {
							await addProductsToCart( siteSlug as string, flowName as string, [ domainCartItem ] );
						}

						const returnUrl = encodeURIComponent(
							`/setup/${ flowName }/launchpad?siteSlug=${ providedDependencies?.siteSlug }`
						);

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }`
						);
					}
			}
		}

		return { submit };
	},
};

export default domainUpsell;
