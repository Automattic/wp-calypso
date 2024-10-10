import { UserSelect } from '@automattic/data-stores';
import { HUNDRED_YEAR_DOMAIN_FLOW } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
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

		const checkoutBackUrl = new URL( `/setup/${ flowName }/domains`, window.location.href );

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			switch ( _currentStep ) {
				case 'domains':
					clearSignupDestinationCookie();

					if ( userIsLoggedIn ) {
						return navigate( 'createSite' );
					}

					return window.location.assign( logInUrl );
				case 'createSite':
					return navigate( 'processing' );
				case 'processing':
					setSignupCompleteSlug( providedDependencies.siteSlug );
					setSignupCompleteFlowName( flowName );

					// use replace instead of assign to remove the processing URL from history
					return window.location.replace(
						`/checkout/${ encodeURIComponent(
							providedDependencies.siteSlug as string
						) }?signup=1&checkoutBackUrl=${ encodeURIComponent( checkoutBackUrl.href ) }`
					);
			}
		}

		return { submit };
	},
};

export default HundredYearDomainFlow;
