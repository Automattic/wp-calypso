import { UserSelect } from '@automattic/data-stores';
import { useLocale } from '@automattic/i18n-utils';
import { ONBOARDING_FLOW, useFlowProgress } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupDestinationCookie,
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { useDomainParams } from '../hooks/use-domain-params';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { AssertConditionState, ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const onboarding: Flow = {
	name: ONBOARDING_FLOW,
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
		const flowName = ONBOARDING_FLOW;
		const siteSlug = useSiteSlug();
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

		function goBack() {
			if ( 'domains' === currentStep ) {
				return window.location.assign(
					encodeURIComponent( `/setup/${ flowName }/launchpad?siteSlug=${ siteSlug }` )
				);
			}
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
					clearSignupDestinationCookie(); // not sure if this is needed and if it is, where it should go
					return navigate( 'processing' );
				case 'processing': {
					clearSignupDestinationCookie();
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
			}

			return providedDependencies;
		}

		return {
			submit,
			goBack,
		};
	},
	useAssertConditions() {
		const flowName = ONBOARDING_FLOW;
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
