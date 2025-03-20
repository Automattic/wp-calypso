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
import { getQuery } from '../../../utils/get-query';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { useFlowState } from '../../internals/state-manager/store';
import { STEPS } from '../../internals/steps';
import { ProvidedDependencies } from '../../internals/types';
import type { FlowV2, SubmitFunction } from '../../internals/types';

const DEFAULT_NEWSLETTER_THEME = 'pub/lettre';

/**
 * We define the initialize function before the flow. This gives us to know the steps of the flow before constructing the flow.
 * And this allows us to infer the type of all the utilities in the flow (navigate, useStepNavigation, etc.)
 * @returns The steps of the flow.
 */
function initialize() {
	const query = getQuery();
	const isComingFromMarketingPage = query[ 'ref' ] === 'newsletter-lp';

	const { setHidePlansFeatureComparison, setIntent } = dispatch( ONBOARD_STORE ) as OnboardActions;

	// We can just call these. They're guaranteed to run once.
	setHidePlansFeatureComparison( true );
	clearSignupDestinationCookie();
	setIntent( Onboard.SiteIntent.Newsletter );

	const privateSteps = stepsWithRequiredLogin( [
		STEPS.NEWSLETTER_SETUP,
		STEPS.NEWSLETTER_GOALS,
		STEPS.UNIFIED_DOMAINS,
		STEPS.UNIFIED_PLANS,
		STEPS.PROCESSING,
		STEPS.SUBSCRIBERS,
		STEPS.LAUNCHPAD,
		STEPS.ERROR,
	] as const );

	if ( ! isComingFromMarketingPage ) {
		return [ STEPS.INTRO, ...privateSteps ] as const;
	}

	return privateSteps;
}

/**
 * The Flow's type infers a lot of information from the initialize function.
 */
const newsletter: FlowV2< typeof initialize > = {
	name: EXAMPLE_FLOW,
	get title() {
		return translate( 'Newsletter Example Flow' );
	},
	__experimentalUseSessions: true,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	initialize,
	/**
	 * This is the main hook that is used to navigate through the flow.
	 * @param currentStepSlug - Thanks to the strongly typed flow, this slug won't be of type string, but of the union of the all slugs in the flow.
	 * @param navigate - The navigate function. Will only allow navigation to the steps defined in the flow.
	 */
	useStepNavigation( currentStepSlug, navigate ) {
		const flowName = this.name;
		const siteSlug = useSiteSlug();
		const { get, set } = useFlowState();
		const { exitFlow } = useExitFlow();
		const { setPendingAction } = useDispatch( ONBOARD_STORE );
		const { saveSiteSettings } = useDispatch( SITE_STORE );

		const createSite = useCreateSite();

		const { getPostFlowUrl, initializeLaunchpadState } = useLaunchpadDecider< typeof navigate >( {
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

		triggerGuidesForStep( flowName, currentStepSlug );

		const submit: SubmitFunction< typeof newsletter, typeof currentStepSlug > = (
			providedDependencies
		) => {
			const launchpadUrl = `/setup/${ flowName }/launchpad?siteSlug=${ providedDependencies.siteSlug }`;

			switch ( currentStepSlug ) {
				case 'intro':
					return navigate( 'newsletterSetup' );

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
					if ( site ) {
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

export default newsletter;
