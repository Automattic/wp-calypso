import { LaunchpadNavigator, type OnboardSelect, type UserSelect } from '@automattic/data-stores';
import { isAssemblerDesign } from '@automattic/design-picker';
import { useLocale } from '@automattic/i18n-utils';
import { useFlowProgress, FREE_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { getLocaleFromQueryParam, getLocaleFromPathname } from 'calypso/boot/locale';
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
import { getLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { STEPS } from './internals/steps';
import { ProcessingResult } from './internals/steps-repository/processing-step/constants';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from './internals/types';

const free: Flow = {
	name: FREE_FLOW,
	get title() {
		return translate( 'Free' );
	},
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
		const { setStepProgress, setPendingAction } = useDispatch( ONBOARD_STORE );
		const flowProgress = useFlowProgress( { stepName: _currentStep, flowName } );
		setStepProgress( flowProgress );
		const siteId = useSiteIdParam();
		const siteSlug = useSiteSlug();
		const selectedDesign = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getSelectedDesign(),
			[]
		);
		const { setActiveChecklist } = useDispatch( LaunchpadNavigator.store );

		// trigger guides on step movement, we don't care about failures or response
		wpcom.req.post(
			'guides/trigger',
			{
				apiNamespace: 'wpcom/v2/',
			},
			{
				flow: flowName,
				step: _currentStep,
			}
		);

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
					return navigate( 'site-creation-step' );

				case 'site-creation-step':
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
						return navigate( 'patternAssembler' );
					}

					return navigate( `processing?siteSlug=${ siteSlug }` );

				case 'patternAssembler': {
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
				case 'patternAssembler':
					return navigate( 'designSetup' );
			}
		};

		const goNext = async () => {
			switch ( _currentStep ) {
				case 'launchpad':
					skipLaunchpad( {
						checklistSlug: 'free',
						setActiveChecklist,
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

	useAssertConditions(): AssertConditionResult {
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		const queryParams = new URLSearchParams( window.location.search );
		const flowName = this.name;

		// There is a race condition where useLocale is reporting english,
		// despite there being a locale in the URL so we need to look it up manually.
		// We also need to support both query param and path suffix localized urls
		// depending on where the user is coming from.
		const useLocaleSlug = useLocale();
		// Query param support can be removed after dotcom-forge/issues/2960 and 2961 are closed.
		const queryLocaleSlug = getLocaleFromQueryParam();
		const pathLocaleSlug = getLocaleFromPathname();
		const locale = queryLocaleSlug || pathLocaleSlug || useLocaleSlug;

		const flags = queryParams.get( 'flags' );
		const siteSlug = queryParams.get( 'siteSlug' );

		const getStartUrl = () => {
			let hasFlowParams = false;
			const flowParams = new URLSearchParams();

			if ( siteSlug ) {
				flowParams.set( 'siteSlug', siteSlug );
				hasFlowParams = true;
			}

			if ( locale && locale !== 'en' ) {
				flowParams.set( 'locale', locale );
				hasFlowParams = true;
			}

			const redirectTarget =
				window?.location?.pathname +
				( hasFlowParams ? encodeURIComponent( '?' + flowParams.toString() ) : '' );

			const logInUrl = getLoginUrl( {
				variationName: flowName,
				redirectTo: redirectTarget,
				locale,
			} );

			return logInUrl + ( flags ? `&flags=${ flags }` : '' );
		};

		// Despite sending a CHECKING state, this function gets called again with the
		// /setup/blog/blogger-intent route which has no locale in the path so we need to
		// redirect off of the first render.
		// This effects both /setup/blog/<locale> starting points and /setup/blog/blogger-intent/<locale> urls.
		// The double call also hapens on urls without locale.
		useEffect( () => {
			if ( ! userIsLoggedIn ) {
				const logInUrl = getStartUrl();
				window.location.assign( logInUrl );
			}
		}, [] );

		if ( ! userIsLoggedIn ) {
			const logInUrl = getStartUrl();
			window.location.assign( logInUrl );
			result = {
				state: AssertConditionState.FAILURE,
				message: 'free-flow requires a logged in user',
			};
		}

		return result;
	},
};

export default free;
