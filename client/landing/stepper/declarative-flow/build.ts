import { BUILD_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { useExitFlow } from '../hooks/use-exit-flow';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
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
