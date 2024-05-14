import { type OnboardSelect, type UserSelect } from '@automattic/data-stores';
import { isAssemblerDesign } from '@automattic/design-picker';
import { FREE_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useFlowLoginUrl } from 'calypso/landing/stepper/hooks/use-flow-login-url';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { USER_STORE, ONBOARD_STORE } from '../stores';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { STEPS } from './internals/steps';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import {
	type AssertConditionResult,
	AssertConditionState,
	type Flow,
	type ProvidedDependencies,
} from './internals/types';

const free: Flow = {
	name: FREE_FLOW,
	get title() {
		return translate( 'Free' );
	},
	isSignupFlow: true,
	useSteps() {
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );

		useEffect( () => {
			resetOnboardStore();
		}, [] );

		return [
			STEPS.FREE_SETUP,
			STEPS.PROCESSING,
			STEPS.SITE_CREATION_STEP,
			STEPS.LAUNCHPAD,
			STEPS.DESIGN_SETUP,
			STEPS.PATTERN_ASSEMBLER,
			STEPS.ERROR,
		];
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const { setPendingAction } = useDispatch( ONBOARD_STORE );
		const siteId = useSiteIdParam();
		const siteSlug = useSiteSlug();
		const selectedDesign = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
			[]
		);

		triggerGuidesForStep( flowName, _currentStep );

		const exitFlow = ( to: string ) => {
			setPendingAction( () => {
				return new Promise( () => {
					window.location.assign( to );
				} );
			} );

			return navigate( 'processing' );
		};

		const submit = ( providedDependencies: ProvidedDependencies = {}, ...results: string[] ) => {
			recordSubmitStep( providedDependencies, '', flowName, _currentStep );

			switch ( _currentStep ) {
				case 'freeSetup':
					return navigate( 'create-site' );

				case 'create-site':
					return navigate( 'processing' );

				case 'processing':
					if ( results.some( ( result ) => result === ProcessingResult.FAILURE ) ) {
						return navigate( 'error' );
					}

					if ( providedDependencies?.goToHome && providedDependencies?.siteSlug ) {
						return window.location.replace(
							addQueryArgs( `/home/${ siteId ?? providedDependencies?.siteSlug }`, {
								celebrateLaunch: true,
								launchpadComplete: true,
							} )
						);
					}

					if ( isAssemblerDesign( selectedDesign ) ) {
						const params = new URLSearchParams( {
							canvas: 'edit',
							assembler: '1',
						} );

						return exitFlow( `/site-editor/${ siteSlug }?${ params }` );
					}

					if ( selectedDesign ) {
						return navigate( `launchpad?siteSlug=${ siteSlug }` );
					}

					return navigate( `designSetup?siteSlug=${ providedDependencies?.siteSlug }` );

				case 'designSetup':
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

					if ( providedDependencies?.shouldGoToAssembler ) {
						return navigate( 'pattern-assembler' );
					}

					return navigate( `processing?siteSlug=${ siteSlug }` );

				case 'pattern-assembler': {
					return navigate( `processing?siteSlug=${ siteSlug }` );
				}

				case 'launchpad': {
					return navigate( 'processing' );
				}
			}
			return providedDependencies;
		};

		const goBack = () => {
			switch ( _currentStep ) {
				case 'pattern-assembler':
					return navigate( 'designSetup' );
			}
		};

		const goNext = async () => {
			switch ( _currentStep ) {
				case 'launchpad':
					skipLaunchpad( {
						checklistSlug: 'free',
						siteId,
						siteSlug,
					} );
					return;

				default:
					return navigate( 'freeSetup' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},

	useAssertConditions( navigate, currentStepSlug ): AssertConditionResult {
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		const loginUrlParams: Record< string, string | number > = {};
		const returnUrlParams: Record< string, string | number > = {};

		const queryParams = new URLSearchParams( window.location.search );
		const flags = queryParams.get( 'flags' );
		const siteSlug = queryParams.get( 'siteSlug' );

		if ( flags ) {
			loginUrlParams.flags = flags;
		}
		if ( siteSlug ) {
			returnUrlParams.siteSlug = siteSlug;
		}

		const logInUrl = useFlowLoginUrl( {
			flow: this,
			loginUrlParams,
			returnUrlParams,
			returnStepSlug: currentStepSlug,
		} );

		useEffect( () => {
			if ( ! userIsLoggedIn ) {
				window.location.assign( logInUrl );
			}
		}, [ logInUrl ] );

		if ( ! userIsLoggedIn ) {
			result = {
				state: AssertConditionState.FAILURE,
				message: 'free-flow requires a logged in user',
			};
		}

		return result;
	},
};

export default free;
