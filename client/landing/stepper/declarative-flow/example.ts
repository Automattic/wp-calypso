import { updateLaunchpadSettings } from '@automattic/data-stores';
import { EXAMPLE_FLOW } from '@automattic/onboarding';
import { useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useLaunchpadDecider } from 'calypso/landing/stepper/declarative-flow/internals/hooks/use-launchpad-decider';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { useCreateSite } from '../hooks/use-create-site';
import { useExitFlow } from '../hooks/use-exit-flow';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE } from '../stores';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { useFlowState } from './internals/state-manager/store';
import { STEPS } from './internals/steps';
import type { Flow } from './internals/types';

const DEFAULT_NEWSLETTER_THEME = 'pub/lettre';

const newsletter: Flow = {
	name: EXAMPLE_FLOW,
	__experimentalUseBuiltinAuth: true,
	get title() {
		return translate( 'Newsletter Example Flow' );
	},
	isSignupFlow: true,
	initialize() {
		const privateSteps = stepsWithRequiredLogin( [
			STEPS.NEWSLETTER_SETUP,
			STEPS.NEWSLETTER_GOALS,
			STEPS.UNIFIED_DOMAINS,
			STEPS.UNIFIED_PLANS,
			STEPS.PROCESSING,
			STEPS.SUBSCRIBERS,
			STEPS.SITE_CREATION_STEP,
			STEPS.LAUNCHPAD,
		] );

		return [ STEPS.INTRO, ...privateSteps ] as const;
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const siteId = useSiteIdParam();
		const siteSlug = useSiteSlug();
		const query = useQuery();
		const { exitFlow } = useExitFlow();
		const isComingFromMarketingPage = query.get( 'ref' ) === 'newsletter-lp';
		const { set } = useFlowState();
		const createSite = useCreateSite();
		const { setPendingAction } = useDispatch( ONBOARD_STORE );

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

		function submit( providedDependencies = {} ) {
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

				case 'plans': {
					set( 'plans', providedDependencies );

					setPendingAction( () =>
						createSite( {
							theme: DEFAULT_NEWSLETTER_THEME,
							siteIntent: 'newsletter',
						} )
					);

					return navigate( 'processing' );
				}
				case 'processing': {
					const result = set( 'processing', providedDependencies );
					if ( result ) {
						const launchpadUrl = `/setup/${ flowName }/launchpad?siteSlug=${ result.siteSlug }`;
						if ( result.goToHome && result.siteSlug ) {
							return window.location.replace(
								addQueryArgs( `/home/${ siteId ?? result?.siteSlug }`, {
									celebrateLaunch: true,
									launchpadComplete: true,
								} )
							);
						}

						if ( result.goToCheckout && result.siteSlug ) {
							return window.location.assign(
								`/checkout/${ encodeURIComponent(
									result?.siteSlug as string
								) }?redirect_to=${ encodeURIComponent( launchpadUrl ) }&signup=1`
							);
						}

						initializeLaunchpadState( {
							siteId: result.siteId,
							siteSlug: result.siteSlug,
						} );

						return window.location.assign(
							getPostFlowUrl( {
								flow: flowName,
								siteId: result.siteId,
								siteSlug: result.siteSlug,
							} )
						);
					}
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
						checklistSlug: 'newsletter',
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
} as const;

export default newsletter;
