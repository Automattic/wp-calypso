import { Onboard, OnboardActions, updateLaunchpadSettings } from '@automattic/data-stores';
import { EXAMPLE_FLOW } from '@automattic/onboarding';
import { dispatch, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useLaunchpadDecider } from 'calypso/landing/stepper/declarative-flow/internals/hooks/use-launchpad-decider';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useCreateSite } from '../../../hooks/use-create-site-hook';
import { useExitFlow } from '../../../hooks/use-exit-flow';
import { useSiteSlug } from '../../../hooks/use-site-slug';
import { ONBOARD_STORE, SITE_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { useFlowState } from '../../internals/state-manager/store';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { FlowV2, SubmitHandler, Navigate } from '../../internals/types';

const DEFAULT_NEWSLETTER_THEME = 'pub/lettre';

function initialize() {
	const { setHidePlansFeatureComparison, setIntent } = dispatch( ONBOARD_STORE ) as OnboardActions;

	// We can just call these. They're guaranteed to run once.
	setHidePlansFeatureComparison( true );
	clearSignupDestinationCookie();
	setIntent( Onboard.SiteIntent.Newsletter );

	return stepsWithRequiredLogin( [
		STEPS.NEWSLETTER_SETUP,
		STEPS.NEWSLETTER_GOALS,
		STEPS.UNIFIED_DOMAINS,
		STEPS.UNIFIED_PLANS,
		STEPS.PROCESSING,
		STEPS.SUBSCRIBERS,
		STEPS.LAUNCHPAD,
		STEPS.ERROR,
	] );
}

const exampleFlow: FlowV2< typeof initialize > = {
	name: EXAMPLE_FLOW,
	get title() {
		return translate( 'Newsletter Example Flow' );
	},
	__experimentalUseSessions: true,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	initialize,
	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const siteSlug = useSiteSlug();
		const { get, set } = useFlowState();
		const { exitFlow } = useExitFlow();
		const { setPendingAction } = useDispatch( ONBOARD_STORE );
		const { saveSiteSettings } = useDispatch( SITE_STORE );

		const createSite = useCreateSite();

		const { getPostFlowUrl, initializeLaunchpadState } = useLaunchpadDecider( {
			exitFlow,
			navigate: navigate as Navigate,
		} );

		const completeSubscribersTask = async () => {
			if ( siteSlug ) {
				await updateLaunchpadSettings( siteSlug, {
					checklist_statuses: { subscribers_added: true },
				} );
			}
		};

		triggerGuidesForStep( flowName, _currentStep );

		/**
		 * This is where step's submitted data is processed.
		 * @param submittedStep - The step that was submitted. It contains the step's slug and the step's submitted data.
		 */
		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case 'newsletterSetup':
					set( 'newsletterSetup', providedDependencies );
					return navigate( 'newsletterGoals' );

				case 'newsletterGoals':
					set( 'newsletterGoals', providedDependencies );
					return navigate( 'domains' );

				case 'domains':
					set( 'domains', providedDependencies );
					return navigate( 'plans' );

				case 'plans':
					set( 'plans', providedDependencies );
					setPendingAction( () =>
						createSite( {
							theme: DEFAULT_NEWSLETTER_THEME,
							siteIntent: Onboard.SiteIntent.Newsletter,
						} ).then( ( siteCreationResult ) => {
							// update site settings but return the siteCreationResult when done.
							return saveSiteSettings( siteCreationResult.siteSlug, {
								launchpad_screen: 'full',
							} ).then( () => siteCreationResult );
						} )
					);
					return navigate( 'processing' );
				case 'processing': {
					const site = get( 'site' );
					if ( site && providedDependencies?.processingResult === ProcessingResult.SUCCESS ) {
						const launchpadUrl = `/setup/${ flowName }/launchpad?siteSlug=${ site.siteSlug }`;

						const { siteId, siteSlug } = site;
						initializeLaunchpadState( {
							siteId: siteId,
							siteSlug: siteSlug,
						} );

						if ( providedDependencies?.goToHome ) {
							return window.location.replace(
								addQueryArgs( `/home/${ siteId }`, {
									celebrateLaunch: true,
									launchpadComplete: true,
								} )
							);
						}

						if ( providedDependencies?.goToCheckout ) {
							persistSignupDestination( launchpadUrl );
							setSignupCompleteSlug( providedDependencies?.siteSlug );
							setSignupCompleteFlowName( flowName );

							// Replace the processing step with checkout step, so going back goes to Plans.
							return window.location.replace(
								`/checkout/${ encodeURIComponent( siteSlug ) }?redirect_to=${ encodeURIComponent(
									launchpadUrl
								) }&signup=1`
							);
						}

						const postFlowUrl = getPostFlowUrl( {
							flow: flowName,
							siteId: siteId as number,
							siteSlug: siteSlug as string,
						} );

						return window.location.replace( postFlowUrl );
					}
					// handle site creation error.
					return navigate( 'error' );
				}

				case 'subscribers':
					completeSubscribersTask();
					return navigate( 'launchpad' );
			}
		};

		return { submit };
	},
};

export default exampleFlow;
