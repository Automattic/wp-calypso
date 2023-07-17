import { UserSelect } from '@automattic/data-stores';
import { ONBOARDING_PM_FLOW, useFlowProgress } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupDestinationCookie,
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { useDomainParams } from '../hooks/use-domain-params';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { AssertConditionState, ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const onboarding: Flow = {
	name: ONBOARDING_PM_FLOW,
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
		const flowName = ONBOARDING_PM_FLOW;
		const { setStepProgress, setHideFreePlan } = useDispatch( ONBOARD_STORE );
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
					// At the moment, this flow is the only one which doesn't hide the Free plan when a paid domain is picked, so it's done here.
					// Once this behavior is standardized, we will be able to remove this.
					setHideFreePlan( false );
					navigate( 'plans' );
					return;
				case 'plans':
					navigate( 'siteCreationStep' );
					return;
				case 'siteCreationStep':
					clearSignupDestinationCookie();
					navigate( 'processing' );
					return;
				case 'processing': {
					clearSignupDestinationCookie();
					const destination = addQueryArgs( '/setup/site-setup/goals', {
						siteSlug: providedDependencies.siteSlug,
					} );

					/** This is the final destination we want the flow to reach once any intermediary upsells are completed */
					const returnUrl = addQueryArgs( destination, { notice: 'purchase-success' } );
					persistSignupDestination( returnUrl );

					setSignupCompleteSlug( providedDependencies.siteSlug );
					setSignupCompleteFlowName( flowName );

					if ( providedDependencies.goToCheckout ) {
						window.location.assign(
							addQueryArgs(
								`/checkout/${ encodeURIComponent(
									( providedDependencies.siteSlug as string ) ?? ''
								) }`,
								{ signup: 1 }
							)
						);
						return;
					}

					window.location.assign( destination );
					return;
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
		const flowName = ONBOARDING_PM_FLOW;
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const logInUrl = useLoginUrl( {
			redirectTo: `/setup/${ flowName }`,
			pageTitle: 'Onboarding',
			loginPath: `/start/${ flowName }/`,
		} );

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
