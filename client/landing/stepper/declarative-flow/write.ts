import { WRITE_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { STEPS } from './internals/steps';
import { Flow, ProvidedDependencies } from './internals/types';

const WRITE_FLOW_STEPS = stepsWithRequiredLogin( [
	STEPS.LAUNCHPAD,
	STEPS.SUBSCRIBERS,
	STEPS.PROCESSING,
] );

const write: Flow = {
	name: WRITE_FLOW,
	get title() {
		return translate( 'Write' );
	},
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: false,
	useSteps() {
		return WRITE_FLOW_STEPS;
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const siteId = useSiteIdParam();
		const siteSlug = useSiteSlug();

		triggerGuidesForStep( flowName, _currentStep );

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

					return navigate( `launchpad` );
				case 'launchpad': {
					return navigate( 'processing' );
				}
				case 'subscribers': {
					return navigate( 'launchpad' );
				}
			}
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
					return navigate( 'freeSetup' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goToStep, submit };
	},
};

export default write;
