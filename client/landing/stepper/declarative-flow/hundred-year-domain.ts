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

		const checkoutBackUrl = new URL( `/setup/${ flowName }/domains`, window.location.href );

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			const { domainName, productSlug } = providedDependencies;

			const domainCartItem = domainRegistration( {
				productSlug: productSlug as string,
				domain: domainName as string,
				extra: { is_hundred_year_domain: true },
			} );

			switch ( _currentStep ) {
				case 'domains':
					clearSignupDestinationCookie();

					// Adding the domain product to the cart here because this is a domain-only flow
					// and we don't need to create a site for this domain
					await addProductsToCart( 'no-site', flowName, [ domainCartItem ] );

					if ( userIsLoggedIn ) {
						return navigate( 'processing' );
					}

					return window.location.assign( logInUrl );
				case 'processing':
					setSignupCompleteSlug( providedDependencies.siteSlug );
					setSignupCompleteFlowName( flowName );

					// use replace instead of assign to remove the processing URL from history
					return window.location.replace(
						`/checkout/no-site?signup=0&isDomainOnly=1&checkoutBackUrl=${ encodeURIComponent(
							checkoutBackUrl.href
						) }`
					);
			}
		}

		return { submit };
	},
};

export default HundredYearDomainFlow;
