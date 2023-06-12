import { UserSelect } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { ONBOARDING_PM_LOW, useFlowProgress } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { translate } from 'i18n-calypso';
import wpcom from 'calypso/lib/wp';
import {
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { useDomainParams } from '../hooks/use-domain-params';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { AssertConditionState, ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const onboarding: Flow = {
	name: ONBOARDING_PM_LOW,
	get title() {
		return translate( 'Onboarding' );
	},
	useSteps() {
		return [
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/domains' ),
			},
			{
				slug: 'plans',
				asyncComponent: () => import( './internals/steps-repository/plans' ),
			},
			{
				slug: 'siteCreationStep',
				asyncComponent: () => import( './internals/steps-repository/site-creation-step' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		];
	},
	useStepNavigation( currentStep, navigate ) {
		const flowName = ONBOARDING_PM_LOW;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: currentStep, flowName } );
		const { domain, provider } = useDomainParams();

		setStepProgress( flowProgress );

		// trigger guides on step movement, we don't care about failures or response
		wpcom.req.post(
			'guides/trigger',
			{
				apiNamespace: 'wpcom/v2/',
			},
			{
				flow: flowName,
				step: currentStep,
			}
		);

		// DomainsStep apparently has a default behavior for the back button to exit the flow `to` "/sites" page
		// It can also be overriden via the `goBack` prop below
		function exitFlow( to: string ) {
			window.location.assign( to );
		}

		function goBack() {
			if ( 'plans' === currentStep ) {
				navigate( 'domains' );
			}
		}

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, currentStep, undefined, {
				provider,
				domain,
			} );

			switch ( currentStep ) {
				case 'domains':
					return navigate( 'plans' );
				case 'plans':
					return navigate( 'siteCreationStep' );
				case 'siteCreationStep':
					// clearSignupDestinationCookie(); // not sure if this is needed and if it is, where it should go
					return navigate( 'processing' );
				case 'processing': {
					// clearSignupDestinationCookie();
					if ( providedDependencies?.goToCheckout ) {
						const destination = `/setup/site-setup/goals?siteSlug=${ providedDependencies.siteSlug }&notice=purchase-success`;
						const returnUrl = encodeURIComponent( destination );

						persistSignupDestination( destination ); // not sure if this is needed
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowName );

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1`
						);
					}

					return window.location.assign(
						`/setup/site-setup/goals?siteSlug=${
							encodeURIComponent( providedDependencies?.siteSlug as string ) ?? ''
						}`
					);
				}
			}

			return providedDependencies;
		}

		return {
			submit,
			goBack,
			exitFlow,
		};
	},
	useAssertConditions() {
		const flowName = ONBOARDING_PM_LOW;
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const locale = useLocale();
		const logInUrl =
			locale && locale !== 'en'
				? `/start/account/user/${ locale }?redirect_to=/setup/${ flowName }`
				: `/start/account/user?redirect_to=/setup/${ flowName }`;

		if ( ! userIsLoggedIn ) {
			window.location.assign( logInUrl );

			return {
				state: AssertConditionState.FAILURE,
			};
		}

		return {
			state: AssertConditionState.SUCCESS,
		};
	},
};

export default onboarding;
