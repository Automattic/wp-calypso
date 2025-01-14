import { updateLaunchpadSettings } from '@automattic/data-stores';
import { createSiteWithCart, EXAMPLE_FLOW } from '@automattic/onboarding';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useLaunchpadDecider } from 'calypso/landing/stepper/declarative-flow/internals/hooks/use-launchpad-decider';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import { useExitFlow } from '../hooks/use-exit-flow';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { useFlowState } from './internals/state-manager/store';
import { STEPS } from './internals/steps';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';
import { setPendingAction } from '@automattic/data-stores/src/onboard/actions';

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

		return [ STEPS.INTRO, ...privateSteps ];

		return privateSteps;
	},

	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const siteId = useSiteIdParam();
		const siteSlug = useSiteSlug();
		const query = useQuery();
		const { exitFlow } = useExitFlow();
		const isComingFromMarketingPage = query.get( 'ref' ) === 'newsletter-lp';
		const { get, set } = useFlowState();

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
				case 'intro':
					return navigate( 'newsletterSetup' );

				case 'newsletterSetup':
					return navigate( 'newsletterGoals' );

				case 'newsletterGoals':
					return navigate( 'domains' );

				case 'domains':
					set( 'domains', providedDependencies );
					return navigate( 'plans' );

				case 'plans':
					set( 'plan', providedDependencies );
					const domains = get('domains');

					setPendingAction( () => {
						return createSiteWithCart( 
							flowName,
							userIsLoggedIn: true,
							siteVisibility: 'public',
							planSlug: providedDependencies.planSlug,
							domainCartItems: domains?.domainCart,
							isPurchasingDomainItem: domains?.isPurchasingDomainItem,
					 );
					} );

					return navigate( 'processing' )
				case 'processing':
					const site = get( 'site' );
					debugger;
					if ( site?.goToHome && site?.siteSlug ) {
						return window.location.replace(
							addQueryArgs( `/home/${ siteId ?? site?.siteSlug }`, {
								celebrateLaunch: true,
								launchpadComplete: true,
							} )
						);
					}

					if ( site?.goToCheckout && site?.siteSlug ) {
						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								site?.siteSlug as string
							) }?redirect_to=${ encodeURIComponent( launchpadUrl ) }&signup=1`
						);
					}

					initializeLaunchpadState( {
						siteId: site?.siteId as number,
						siteSlug: site?.siteSlug as string,
					} );

					return window.location.assign(
						getPostFlowUrl( {
							flow: flowName,
							siteId: site?.siteId as number,
							siteSlug: site?.siteSlug as string,
						} )
					);

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
};

export default newsletter;
