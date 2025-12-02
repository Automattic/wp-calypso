import { DomainSuggestion } from '@automattic/api-core';
import { Onboard, OnboardActions, updateLaunchpadSettings } from '@automattic/data-stores';
import { NEWSLETTER_FLOW } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useDispatch } from '@wordpress/data';
import { addQueryArgs, getQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { useLaunchpadDecider } from 'calypso/landing/stepper/declarative-flow/internals/hooks/use-launchpad-decider';
import { useSite } from 'calypso/landing/stepper/hooks/use-site';
import { getStepFromURL } from 'calypso/landing/stepper/utils/get-flow-from-url';
import { skipLaunchpad } from 'calypso/landing/stepper/utils/skip-launchpad';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { triggerGuidesForStep } from 'calypso/lib/guides/trigger-guides-for-step';
import {
	clearSignupDestinationCookie,
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
} from 'calypso/signup/storageUtils';
import { shouldShowLaunchpadFirst } from 'calypso/state/selectors/should-show-launchpad-first';
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
			STEPS.DOMAIN_SEARCH,
			STEPS.USE_MY_DOMAIN,
			STEPS.PLANS,
			STEPS.PROCESSING,
			STEPS.SUBSCRIBERS,
			STEPS.SITE_CREATION_STEP,
			STEPS.LAUNCHPAD,
		] );
	},
	useTracksEventProps() {
		const site = useSite();
		const step = getStepFromURL();
		if ( site && shouldShowLaunchpadFirst( site ) && step === 'launchpad' ) {
			//prevent track events from firing until we're sure we won't redirect away from Launchpad
			return {
				isLoading: true,
				eventsProperties: {},
			};
		}

		return {
			isLoading: false,
			eventsProperties: {},
		};
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

		const {
			setSiteUrl,
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setSignupDomainOrigin,
			setHideFreePlan,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;

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
				case 'newsletterSetup':
					return navigate( 'newsletterGoals' );

				case 'newsletterGoals':
					return navigate( 'domains' );

				case 'domains': {
					if ( providedDependencies.navigateToUseMyDomain ) {
						const currentQueryArgs = getQueryArgs( window.location.href );

						const useMyDomainURL = addQueryArgs( 'use-my-domain', {
							...currentQueryArgs,
							initialQuery: providedDependencies.lastQuery,
						} );

						return navigate( useMyDomainURL );
					}

					const suggestion = providedDependencies.suggestion as DomainSuggestion;

					setSiteUrl( providedDependencies.siteUrl as string );
					setDomain( suggestion );
					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );
					setHideFreePlan( ! suggestion.is_free );

					return navigate( 'plans' );
				}

				case 'use-my-domain': {
					if (
						providedDependencies &&
						'mode' in providedDependencies &&
						providedDependencies.mode &&
						providedDependencies.domain
					) {
						const destination = addQueryArgs( '/use-my-domain', {
							...getQueryArgs( window.location.href ),
							step: providedDependencies.mode,
							initialQuery: providedDependencies.domain,
						} );
						return navigate( destination as typeof _currentStep );
					}

					if ( providedDependencies && 'domainCartItem' in providedDependencies ) {
						setHideFreePlan( true );
						setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );
						setDomainCartItem( providedDependencies.domainCartItem as MinimalRequestCartProduct );
					}

					return navigate( 'plans' );
				}

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
					await completeSubscribersTask();
					return navigate( 'launchpad' );
			}
		}

		const getGoNext = () => {
			if ( _currentStep === 'use-my-domain' ) {
				return;
			}

			return () => {
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
		};

		const goToStep = ( step: string ) => {
			navigate( step );
		};

		return { goNext: getGoNext(), goToStep, submit };
	},
};

export default newsletter;
