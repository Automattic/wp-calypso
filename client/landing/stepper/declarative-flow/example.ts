import { Onboard, OnboardActions, updateLaunchpadSettings } from '@automattic/data-stores';
import { EXAMPLE_FLOW } from '@automattic/onboarding';
import { dispatch, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useLaunchpadDecider } from 'calypso/landing/stepper/declarative-flow/internals/hooks/use-launchpad-decider';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useCreateSite } from '../hooks/use-create-site-hook';
import { useExitFlow } from '../hooks/use-exit-flow';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE, SITE_STORE } from '../stores';
import { getQuery } from '../utils/get-query';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { useFlowState } from './internals/state-manager/store';
import { STEPS } from './internals/steps';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const DEFAULT_NEWSLETTER_THEME = 'pub/lettre';

const newsletter: Flow = {
	name: EXAMPLE_FLOW,
	get title() {
		return translate( 'Newsletter Example Flow' );
	},
	__experimentalUseSessions: true,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	initialize() {
		const query = getQuery();
		const isComingFromMarketingPage = query[ 'ref' ] === 'newsletter-lp';

		const { setHidePlansFeatureComparison, setIntent } = dispatch(
			ONBOARD_STORE
		) as OnboardActions;

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
		] );

		if ( ! isComingFromMarketingPage ) {
			return [ STEPS.INTRO, ...privateSteps ];
		}

		return privateSteps;
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const siteId = useSiteIdParam();
		const siteSlug = useSiteSlug();
		const query = useQuery();
		const { get, set } = useFlowState();
		const { exitFlow } = useExitFlow();
		const isComingFromMarketingPage = query.get( 'ref' ) === 'newsletter-lp';
		const { setPendingAction } = useDispatch( ONBOARD_STORE );
		const { saveSiteSettings } = useDispatch( SITE_STORE );

		const createSite = useCreateSite();

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

		async function submit( providedDependencies: ProvidedDependencies = {} ) {
			const launchpadUrl = `/setup/${ flowName }/launchpad?siteSlug=${ providedDependencies.siteSlug }`;

			switch ( _currentStep ) {
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
		}

		const goBack = () => {
			return;
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
					return navigate( isComingFromMarketingPage ? 'newsletterSetup' : 'intro' );
			}
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext, goBack, goToStep, submit };
	},
};

export default newsletter;
