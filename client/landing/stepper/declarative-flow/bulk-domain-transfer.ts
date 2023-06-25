import { useLocale } from '@automattic/i18n-utils';
import { BULK_DOMAIN_TRANSFER } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { USER_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import type { Flow, ProvidedDependencies } from './internals/types';
import type { UserSelect } from '@automattic/data-stores';

const bulkDomainTransfer: Flow = {
	name: BULK_DOMAIN_TRANSFER,
	get title() {
		return translate( 'Bulk domain transfer' );
	},
	useSteps() {
		return [
			{
				slug: 'intro',
				asyncComponent: () => import( './internals/steps-repository/bulk-domain-transfer-intro' ),
			},
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/bulk-domain-transfer-domains' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		];
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const locale = useLocale();

		const logInUrl =
			locale && locale !== 'en'
				? `/start/account/user/${ locale }?variationName=${ flowName }&pageTitle=Bulk+Transfer&redirect_to=/setup/${ flowName }/domain`
				: `/start/account/user?variationName=${ flowName }&pageTitle=Bulk+Transfer&redirect_to=/setup/${ flowName }/pattedomainrns`;

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

			switch ( _currentStepSlug ) {
				case 'intro':
					clearSignupDestinationCookie();

					if ( userIsLoggedIn ) {
						return navigate( 'domains' );
					}
					return window.location.assign( logInUrl );
				case 'domains': {
					// go to processing step without pushing it to history
					// so the back button would go back to domains step
					return navigate( 'processing', undefined );
				}
				case 'processing': {
					const destination = '/domains/manage?filter=owned-by-me';
					persistSignupDestination( destination );
					setSignupCompleteSlug( providedDependencies?.siteSlug );
					setSignupCompleteFlowName( flowName );
					const returnUrl = encodeURIComponent( destination );

					const checkoutBackURL = new URL( window.location.href );

					// use replace instead of assign to remove the processing URL from history
					return window.location.replace(
						`/checkout/no-site?redirect_to=${ returnUrl }&signup=0&isDomainOnly=1&checkoutBackUrl=${ encodeURIComponent(
							checkoutBackURL.href
						) }`
					);
				}
				default:
					return;
			}
		};

		const goBack = () => {
			switch ( _currentStepSlug ) {
				case 'domains':
					return navigate( 'intro' );
				default:
					return;
			}
		};

		return { goBack, submit };
	},
};

export default bulkDomainTransfer;
