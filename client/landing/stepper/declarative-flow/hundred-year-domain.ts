import { PLAN_100_YEARS, getPlan } from '@automattic/calypso-products';
import { addProductsToCart } from '@automattic/onboarding';
import { useEffect } from 'react';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import type { ProvidedDependencies, Flow } from './internals/types';

const HundredYearDomainFlow: Flow = {
	name: 'hundred-year-domain',

	get title() {
		return ( getPlan( PLAN_100_YEARS )?.getTitle() || '' ) as string;
	},

	isSignupFlow: true,

	useSteps() {
		const steps = [
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/domains' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
			{
				slug: 'createSite',
				asyncComponent: () => import( './internals/steps-repository/create-site' ),
			},
		];

		return stepsWithRequiredLogin( steps );
	},

	useSideEffect() {
		useEffect( () => {
			clearSignupDestinationCookie();
		}, [] );
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			const { domainName, productSlug } = providedDependencies;

			const addDomainToCart = async () => {
				const productsToAdd = [
					domainRegistration( {
						domain: domainName as string,
						productSlug: productSlug as string,
						extra: { is_hundred_year_domain: true },
					} ),
				];
				await addProductsToCart( 'no-site', '100-year-domain', productsToAdd );

				return {
					siteId: null,
					siteSlug: 'no-site',
					goToCheckout: true,
				};
			};

			switch ( _currentStep ) {
				case 'domains':
					addDomainToCart();
					return navigate( 'createSite' );
				case 'createSite':
					return navigate( 'processing' );
				case 'processing':
					if ( providedDependencies?.goToCheckout && providedDependencies?.siteSlug ) {
						setSignupCompleteSlug( providedDependencies.siteSlug );
						setSignupCompleteFlowName( flowName );

						// return window.location.assign( `/checkout/no-site?signup=1` );
						return window.location.assign( `/checkout/no-site?signup=1&isDomainOnly=1` );
					}
			}
		}

		return { submit };
	},
};

export default HundredYearDomainFlow;
