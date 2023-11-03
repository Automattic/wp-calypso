import {
	LaunchpadNavigator,
	updateLaunchpadSettings,
	type UserSelect,
} from '@automattic/data-stores';
import { useFlowProgress, NEWSLETTER_FLOW } from '@automattic/onboarding';
import { useSelect, useDispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useEffect } from 'react';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import wpcom from 'calypso/lib/wp';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { useSiteIdParam } from '../hooks/use-site-id-param';
import { useSiteSlug } from '../hooks/use-site-slug';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { useLoginUrl } from '../utils/path';
import { recordSubmitStep } from './internals/analytics/record-submit-step';
import { ProvidedDependencies } from './internals/types';
import type { Flow } from './internals/types';

const newsletter: Flow = {
	name: NEWSLETTER_FLOW,
	get title() {
		return translate( 'Newsletter' );
	},
	useSteps() {
		const query = useQuery();
		const isComingFromMarketingPage = query.get( 'ref' ) === 'newsletter-lp';
		return [
			// Load intro step component only when not coming from the marketing page
			...( ! isComingFromMarketingPage
				? [
						{ slug: 'intro', asyncComponent: () => import( './internals/steps-repository/intro' ) },
				  ]
				: [] ),
			{
				slug: 'newsletterSetup',
				asyncComponent: () => import( './internals/steps-repository/newsletter-setup' ),
			},
			{
				slug: 'newsletterGoals',
				asyncComponent: () => import( './internals/steps-repository/newsletter-goals' ),
			},
			{ slug: 'domains', asyncComponent: () => import( './internals/steps-repository/domains' ) },
			{ slug: 'plans', asyncComponent: () => import( './internals/steps-repository/plans' ) },
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
			{
				slug: 'subscribers',
				asyncComponent: () => import( './internals/steps-repository/subscribers' ),
			},
			{
				slug: 'siteCreationStep',
				asyncComponent: () => import( './internals/steps-repository/site-creation-step' ),
			},
			{
				slug: 'launchpad',
				asyncComponent: () => import( './internals/steps-repository/launchpad' ),
			},
		];
	},
	useSideEffect( currentStepRoute: string ) {
		const { setHidePlansFeatureComparison } = useDispatch( ONBOARD_STORE );
		useEffect( () => {
			setHidePlansFeatureComparison( true );
			clearSignupDestinationCookie();
		}, [] );

		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);

		const isLoadingIntroScreen = 'intro' === currentStepRoute || undefined === currentStepRoute;

		const logInUrl = useLoginUrl( {
			variationName: this.name,
			redirectTo: `/setup/${ this.name }/newsletterSetup`,
			pageTitle: 'Newsletter',
		} );

		// Unless showing intro step, send non-logged-in users to account screen.
		if ( ! isLoadingIntroScreen && ! userIsLoggedIn ) {
			window.location.assign( logInUrl );
			// Return STOP_FLOW to prevent the flow from rendering.
			return 'STOP_FLOW';
		}
	},
	useStepNavigation( _currentStep, navigate ) {
		const flowName = this.name;
		const userIsLoggedIn = useSelect(
			( select ) => ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			[]
		);
		const siteId = useSiteIdParam();
		const siteSlug = useSiteSlug();
		const { setStepProgress } = useDispatch( ONBOARD_STORE );
		const query = useQuery();
		const isComingFromMarketingPage = query.get( 'ref' ) === 'newsletter-lp';

		const flowProgress = useFlowProgress( {
			stepName: _currentStep,
			flowName,
		} );
		setStepProgress( flowProgress );
		const logInUrl = useLoginUrl( {
			variationName: flowName,
			redirectTo: `/setup/${ flowName }/newsletterSetup`,
			pageTitle: 'Newsletter',
		} );

		const { setActiveChecklist } = useDispatch( LaunchpadNavigator.store );

		const completeSubscribersTask = async () => {
			if ( siteSlug ) {
				await updateLaunchpadSettings( siteSlug, {
					checklist_statuses: { subscribers_added: true },
				} );
			}
		};

		// trigger guides on step movement, we don't care about failures or response
		wpcom.req.post(
			'guides/trigger',
			{
				apiNamespace: 'wpcom/v2/',
			},
			{
				flow: flowName,
				step: _currentStep,
			}
		);

		function submit( providedDependencies: ProvidedDependencies = {} ) {
			recordSubmitStep( providedDependencies, '', flowName, _currentStep );
			const launchpadUrl = `/setup/${ flowName }/launchpad?siteSlug=${ providedDependencies.siteSlug }`;

			switch ( _currentStep ) {
				case 'intro':
					if ( userIsLoggedIn ) {
						return navigate( 'newsletterSetup' );
					}
					return window.location.assign( logInUrl );

				case 'newsletterSetup':
					return navigate( 'newsletterGoals' );

				case 'newsletterGoals':
					return navigate( 'domains' );

				case 'domains':
					return navigate( 'plans' );

				case 'plans':
					return navigate( 'siteCreationStep' );

				case 'siteCreationStep':
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

					if ( providedDependencies?.goToCheckout ) {
						persistSignupDestination( launchpadUrl );
						setSignupCompleteSlug( providedDependencies?.siteSlug );
						setSignupCompleteFlowName( flowName );

						return window.location.assign(
							`/checkout/${ encodeURIComponent(
								( providedDependencies?.siteSlug as string ) ?? ''
							) }?redirect_to=${ launchpadUrl }&signup=1`
						);
					}

					return window.location.assign(
						`/setup/${ flowName }/launchpad?siteSlug=${ providedDependencies.siteSlug }`
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
						setActiveChecklist,
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
