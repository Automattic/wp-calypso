import { OnboardSelect } from '@automattic/data-stores';
import { BUILD_FLOW } from '@automattic/onboarding';
import { useSelect } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useMemo, useRef } from 'react';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { STEPPER_TRACKS_EVENT_SIGNUP_STEP_START } from '../constants';
import { useExitFlow } from '../hooks/use-exit-flow';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import { useGoalsFirstExperiment } from './helpers/use-goals-first-experiment';
import { useLaunchpadDecider } from './internals/hooks/use-launchpad-decider';
import LaunchPad from './internals/steps-repository/launchpad';
import Processing from './internals/steps-repository/processing-step';
import { Flow, ProvidedDependencies } from './internals/types';

const build: Flow = {
	name: BUILD_FLOW,
	get title() {
		return 'WordPress';
	},
	isSignupFlow: false,
	useSteps() {
		return [
			{ slug: 'launchpad', component: LaunchPad },
			{ slug: 'processing', component: Processing },
		];
	},
	useTracksEventProps() {
		const [ isLoading, isGoalsAtFrontExperiment ] = useGoalsFirstExperiment();
		const goals = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
			[]
		);

		// we are only interested in the initial values and not when they values change
		const initialGoals = useRef( goals );

		return useMemo(
			() => ( {
				isLoading,
				eventsProperties: {
					[ STEPPER_TRACKS_EVENT_SIGNUP_STEP_START ]: {
						...( isGoalsAtFrontExperiment && {
							is_goals_first: 'true',
						} ),
						...( initialGoals.current.length && {
							goals: initialGoals.current.join( ',' ),
						} ),
					},
				},
			} ),
			[ isGoalsAtFrontExperiment, initialGoals, isLoading ]
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
			}
			return providedDependencies;
		};

		const goNext = async () => {
			switch ( _currentStep ) {
				case 'launchpad':
					skipLaunchpad( {
						checklistSlug: 'build',
						siteId,
						siteSlug,
					} );
					return;
				default:
					return navigate( 'freeSetup' );
			}
		};

		return { goNext, submit };
	},
};

export default build;
