import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, DOMAIN_TRANSFER } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { getLocaleFromQueryParam, getLocaleFromPathname } from 'calypso/boot/locale';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { redirect } from './internals/steps-repository/import/util';
import {
	Flow,
	ProvidedDependencies,
	AssertConditionResult,
	AssertConditionState,
} from './internals/types';
import type { UserSelect } from '@automattic/data-stores';
const domainTransfer: Flow = {
	name: DOMAIN_TRANSFER,
	get title() {
		return translate( 'Bulk domain transfer' );
	},
	useSteps() {
		return [
			{
				slug: 'intro',
				asyncComponent: () => import( './internals/steps-repository/domain-transfer-intro' ),
			},
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/domain-transfer-domains' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
			{
				slug: 'complete',
				asyncComponent: () => import( './internals/steps-repository/domain-transfer-complete' ),
			},
		];
	},

	useAssertConditions(): AssertConditionResult {
		const flowName = this.name;
		const isLoggedIn = useSelector( isUserLoggedIn );

		// There is a race condition where useLocale is reporting english,
		// despite there being a locale in the URL so we need to look it up manually.
		// We also need to support both query param and path suffix localized urls
		// depending on where the user is coming from.
		const useLocaleSlug = useLocale();
		// Query param support can be removed after dotcom-forge/issues/2960 and 2961 are closed.
		const queryLocaleSlug = getLocaleFromQueryParam();
		const pathLocaleSlug = getLocaleFromPathname();
		const locale = queryLocaleSlug || pathLocaleSlug || useLocaleSlug;

		const logInUrl =
			locale && locale !== 'en'
				? `/start/account/user/${ locale }?redirect_to=/setup/domain-transfer`
				: `/start/account/user?redirect_to=/setup/domain-transfer`;
		useEffect( () => {
			if ( ! isLoggedIn ) {
				redirect( logInUrl );
			}
		}, [] );

		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		if ( ! isLoggedIn ) {
			result = {
				state: AssertConditionState.FAILURE,
				message: `${ flowName } requires a logged in user`,
			};
		}

		return result;
	},
	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStepSlug, flowName } );
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const locale = useLocale();
		setStepProgress( flowProgress );

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
					const destination = '/setup/domain-transfer/complete';
					persistSignupDestination( destination );
					setSignupCompleteSlug( providedDependencies?.siteSlug );
					setSignupCompleteFlowName( flowName );
					const returnUrl = encodeURIComponent( destination );

					const checkoutBackURL = new URL( '/setup/domain-transfer/domains', window.location.href );

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

export default domainTransfer;
