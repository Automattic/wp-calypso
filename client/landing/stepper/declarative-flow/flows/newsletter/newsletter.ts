import { Onboard, updateLaunchpadSettings } from '@automattic/data-stores';
import { NEWSLETTER_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { useLaunchpadDecider } from 'calypso/landing/stepper/declarative-flow/internals/hooks/use-launchpad-decider';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useExitFlow } from '../../../hooks/use-exit-flow';
import { useSiteIdParam } from '../../../hooks/use-site-id-param';
import { useSiteSlug } from '../../../hooks/use-site-slug';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProvidedDependencies } from '../../internals/types';
import type { Flow } from '../../internals/types';

const newsletter: Flow = {
	name: NEWSLETTER_FLOW,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	useSteps() {
		return stepsWithRequiredLogin( [
			STEPS.NEWSLETTER_SETUP,
			STEPS.NEWSLETTER_GOALS,
			STEPS.DOMAINS,
			STEPS.PLANS,
			STEPS.PROCESSING,
			STEPS.SUBSCRIBERS,
			STEPS.SITE_CREATION_STEP,
			STEPS.LAUNCHPAD,
		] );
	},
	useSideEffect() {
		const { setHidePlansFeatureComparison, setIntent } = useDispatch( ONBOARD_STORE );
		useEffect( () => {
			setHidePlansFeatureComparison( true );
			clearSignupDestinationCookie();
			setIntent( Onboard.SiteIntent.Newsletter );
		}, [] );
	},
	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const siteId = useSiteIdParam();
		const siteSlug = useSiteSlug();
		const { exitFlow } = useExitFlow();

		const { getPostFlowUrl, initializeLaunchpadState } = useLaunchpadDecider( {
			exitFlow,
			navigate,
		} );

		const completeSubscribersTask = async () => {
			if ( siteSlug ) {
				await updateLaunchpadSettings( siteSlug, {
					checklist_statuses: { subscribers_added: true },
				} );
			}
		};

		triggerGuidesForStep( flowName, _currentStep );

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			const launchpadUrl = `/setup/${ flowName }/launchpad?siteSlug=${ providedDependencies.siteSlug }`;

			switch ( _currentStep ) {
				case 'newsletterSetup':
					return navigate( 'newsletterGoals' );

				case 'newsletterGoals':
					return navigate( 'domains' );

				case 'domains':
					return navigate( 'plans' );

				case 'plans':
					return navigate( 'create-site' );

				case 'create-site':
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

					if ( providedDependencies?.goToCheckout && providedDependencies?.siteSlug ) {
						persistSignupDestination( launchpadUrl );
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowName );

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								providedDependencies?.siteSlug as string
							) }?redirect_to=${ encodeURIComponent( launchpadUrl ) }&signup=1`
						);
					}

					initializeLaunchpadState( {
						siteId: providedDependencies?.siteId as number,
						siteSlug: providedDependencies?.siteSlug as string,
					} );

					return window.location.assign(
						getPostFlowUrl( {
							flow: flowName,
							siteId: providedDependencies?.siteId as number,
							siteSlug: providedDependencies?.siteSlug as string,
						} )
					);

				case 'subscribers':
					completeSubscribersTask();
					return navigate( 'launchpad' );
			}
		}

		const goNext = async () => {
			switch ( _currentStep ) {
				case 'launchpad':
					skipLaunchpad( {
						siteId,
						siteSlug,
					} );
					return;

				default:
					return navigate( 'newsletterSetup' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goToStep, submit };
	},
};

export default newsletter;
