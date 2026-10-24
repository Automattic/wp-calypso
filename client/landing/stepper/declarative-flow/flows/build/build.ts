import { OnboardSelect } from '@automattic/data-stores';
import { BUILD_FLOW } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useMemo, useRef } from 'react';
import { useFlowLocale } from 'calypso/landing/stepper/hooks/use-flow-locale';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { STEPPER_TRACKS_EVENT_SIGNUP_STEP_START } from '../../../constants';
import { useExitFlow } from '../../../hooks/use-exit-flow';
import { useSiteIdParam } from '../../../hooks/use-site-id-param';
import { useSiteSlug } from '../../../hooks/use-site-slug';
import { ONBOARD_STORE, USER_STORE } from '../../../stores';
import { getLoginUrl } from '../../../utils/path';
import { useLaunchpadDecider } from '../../internals/hooks/use-launchpad-decider';
import { STEPS } from '../../internals/steps';
import {
	AssertConditionResult,
	AssertConditionState,
	Flow,
	ProvidedDependencies,
} from '../../internals/types';
import type { UserSelect } from '@automattic/data-stores';

const steps = [ STEPS.LAUNCHPAD, STEPS.SUBSCRIBERS, STEPS.PROCESSING ];

const build: Flow = {
	name: BUILD_FLOW,
	get title() {
		return 'WordPress';
	},
	isSignupFlow: false,
	useSteps() {
		return steps;
	},
	useTracksEventProps() {
		const goals = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
			[]
		);

		// we are only interested in the initial values and not when they values change
		const initialGoals = useRef( goals );

		return useMemo(
			() => ( {
				eventsProperties: {
					[ STEPPER_TRACKS_EVENT_SIGNUP_STEP_START ]: {
						...( initialGoals.current.length && {
							goals: initialGoals.current.join( ',' ),
						} ),
					},
				},
			} ),
			[ initialGoals ]
		);
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const siteId = useSiteIdParam();
		const siteSlug = useSiteSlug();
		const { exitFlow } = useExitFlow( { navigate, processing: true } );

		triggerGuidesForStep( flowName, _currentStep );

		const { postFlowNavigator, initializeLaunchpadState } = useLaunchpadDecider( {
			exitFlow,
			navigate,
		} );

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( _currentStep ) {
				case 'processing':
					if ( providedDependencies?.goToHome && providedDependencies?.siteSlug ) {
						return window.location.replace(
							addQueryArgs( `/home/${ siteId ?? providedDependencies?.siteSlug }`, {
								celebrateLaunch: true,
								launchpadComplete: true,
							} )
						);
					}

					initializeLaunchpadState( {
						siteId,
						siteSlug: ( providedDependencies?.siteSlug ?? siteSlug ) as string,
					} );

					return postFlowNavigator( { siteId, siteSlug } );
				case 'launchpad': {
					return navigate( 'processing' );
				}
				case 'subscribers': {
					return navigate( 'launchpad' );
				}
			}
			return providedDependencies;
		};

		const goNext = async () => {
			switch ( _currentStep ) {
				case 'launchpad':
					skipLaunchpad( {
						siteId,
						siteSlug,
					} );
					return;
				default:
					return navigate( 'launchpad' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goToStep, submit };
	},

	useAssertConditions(): AssertConditionResult {
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		let result: AssertConditionResult = { state: AssertConditionState.SUCCESS };

		const queryParams = new URLSearchParams( window.location.search );
		const flowName = this.name;

		const locale = useFlowLocale();

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
		// /setup/build/launchpad route which has no locale in the path so we need to
		// redirect off of the first render.
		// This effects both /setup/build/<locale> starting points and /setup/build/launchpad/<locale> urls.
		// The double call also happens on urls without locale.
		useEffect( () => {
			if ( ! userIsLoggedIn ) {
				const logInUrl = getStartUrl();
				window.location.assign( logInUrl );
			}
		}, [] );

		if ( ! userIsLoggedIn ) {
			result = {
				state: AssertConditionState.FAILURE,
				message: 'build-flow requires a logged in user',
			};
		}

		return result;
	},
};

export default build;
