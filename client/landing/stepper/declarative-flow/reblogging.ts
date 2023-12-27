import { type UserSelect } from '@automattic/data-stores';
import { useFlowProgress, REBLOGGING_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import wpcom from 'calypso/lib/wp';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { AssertConditionResult, AssertConditionState } from './internals/types';
import type { Flow, ProvidedDependencies } from './internals/types';

const reblogging: Flow = {
	name: REBLOGGING_FLOW,
	get title() {
		return translate( 'Reblogging' );
	},
	useSteps() {
		return [
			{ slug: 'domains', asyncComponent: () => import( './internals/steps-repository/domains' ) },
			{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
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

	useSideEffect() {
		// const { setHidePlansFeatureComparison } = useDispatch( ONBOARD_STORE );
		// useEffect( () => {
		// 	setHidePlansFeatureComparison( true );
		// } );
	},

	useStepNavigation( _currentStepSlug, navigate ) {
		const flowName = this.name;
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStepSlug, flowName } );
		const siteId = useSiteIdParam();
		const siteSlug = useSiteSlug();

		setStepProgress( flowProgress );

		// trigger guides on step movement, we don't care about failures or response
		wpcom.req.post(
			'guides/trigger',
			{
				apiNamespace: 'wpcom/v2/',
			},
			{
				flow: flowName,
				step: _currentStepSlug,
			}
		);

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStepSlug );

			switch ( _currentStepSlug ) {
				case 'domains':
					return navigate( 'plans' );

				case 'plans':
					return navigate( 'siteCreationStep' );

				case 'siteCreationStep':
					return navigate( 'processing' );

				case 'processing':
					if ( providedDependencies?.goToHome && providedDependencies?.siteSlug ) {
						return window.location.replace(
							addQueryArgs( `/home/${ siteId ?? providedDependencies?.siteSlug }`, {
								celebrateLaunch: true,
								launchpadComplete: true,
							} )
						);
					}

					if ( providedDependencies?.goToCheckout ) {
						const destination = `/setup/${ flowName }/launchpad?siteSlug=${ providedDependencies.siteSlug }`;
						persistSignupDestination( destination );
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowName );
						const returnUrl = encodeURIComponent(
							`/setup/${ flowName }/launchpad?siteSlug=${ providedDependencies?.siteSlug }`
						);

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }?redirect_to=${ returnUrl }&signup=1`
						);
					}

					return navigate( `launchpad?siteSlug=${ providedDependencies?.siteSlug }` );

				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		};

		const goBack = () => {
			return;
		};

		const goNext = async () => {
			switch ( _currentStepSlug ) {
				case 'launchpad':
					skipLaunchpad( {
						checklistSlug: 'link-in-bio',
						siteId,
						siteSlug,
					} );
					return;

				default:
					return navigate( 'intro' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},

	useAssertConditions(): AssertConditionResult {
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };
		const logInUrl = useLoginUrl( {
			variationName: this.name,
			redirectTo: window.location.href.replace( window.location.origin, '' ),
		} );

		if ( ! userIsLoggedIn ) {
			window.location.assign( logInUrl );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'reblogging requires a logged in user',
			};
		}

		return result;
	},
};

export default reblogging;
