import { UserSelect } from '@automattic/data-stores';
import { HUNDRED_YEAR_DOMAIN_FLOW, addProductsToCart } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { domainRegistration } from 'calypso/lib/cart-values/cart-items';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { USER_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import type { ProvidedDependencies, Flow } from './internals/types';

const HundredYearDomainFlow: Flow = {
	name: HUNDRED_YEAR_DOMAIN_FLOW,

	get title() {
		return translate( '100-Year Domain' );
	},

	isSignupFlow: false,

	useSteps() {
		const steps = [
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/domains' ),
			},
			{
				slug: 'createSite',
				asyncComponent: () => import( './internals/steps-repository/create-site' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		];

		return steps;
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: `/setup/${ flowName }/createSite`,
			pageTitle: '100-Year Domain',
		} );

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
				await addProductsToCart( 'no-site', flowName, productsToAdd );

				return {
					siteId: null,
					siteSlug: 'no-site',
					goToCheckout: true,
				};
			};

			switch ( _currentStep ) {
				case 'domains':
					clearSignupDestinationCookie();
					addDomainToCart();

					if ( userIsLoggedIn ) {
						return navigate( 'createSite' );
					}

					return window.location.assign( logInUrl );
				case 'createSite':
					return navigate( 'processing', undefined );
				case 'processing':
					if ( providedDependencies?.goToCheckout && providedDependencies?.siteSlug ) {
						setSignupCompleteSlug( providedDependencies.siteSlug );
						setSignupCompleteFlowName( flowName );

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								providedDependencies.siteSlug as string
							) }?signup=1`
						);
					}
			}
		}

		return { submit };
	},
};

export default HundredYearDomainFlow;
