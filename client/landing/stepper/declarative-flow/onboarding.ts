import { OnboardSelect, Onboard, UserSelect } from '@automattic/data-stores';
import { ONBOARDING_FLOW, clearStepPersistedState } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArg, getQueryArgs, removeQueryArgs } from '@wordpress/url';
import { useState, useMemo, useEffect, useRef } from 'react';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { pathToUrl } from 'calypso/lib/url';
import {
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSlug,
	clearSignupCompleteSlug,
	clearSignupCompleteFlowName,
	clearSignupDestinationCookie,
} from 'calypso/signup/storageUtils';
import { useDispatch as useReduxDispatch, useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import {
	STEPPER_TRACKS_EVENT_SIGNUP_START,
	STEPPER_TRACKS_EVENT_SIGNUP_STEP_START,
	STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
} from '../constants';
import { useFlowLocale } from '../hooks/use-flow-locale';
import { useQuery } from '../hooks/use-query';
import { ONBOARD_STORE, USER_STORE } from '../stores';
import { getLoginUrl } from '../utils/path';
import { stepsWithRequiredLogin } from '../utils/steps-with-required-login';
import { useGoalsFirstExperiment } from './helpers/use-goals-first-experiment';
import { recordStepNavigation } from './internals/analytics/record-step-navigation';
import { STEPS } from './internals/steps';
import { AssertConditionState, Flow, ProvidedDependencies } from './internals/types';

const SiteIntent = Onboard.SiteIntent;

const clearUseMyDomainsQueryParams = ( currentStepSlug: string | undefined ) => {
	const isDomainsStep = currentStepSlug === 'domains';
	const isPlansStepWithQuery =
		currentStepSlug === 'plans' && getQueryArg( window.location.href, 'step' );

	if ( isDomainsStep || isPlansStepWithQuery ) {
		const { pathname, search } = window.location;
		const newURL = removeQueryArgs( pathname + search, 'step', 'initialQuery', 'lastQuery' );
		window.history.replaceState( {}, document.title, newURL );
	}
};

const onboarding: Flow = {
	name: ONBOARDING_FLOW,
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	useTracksEventProps() {
		const isGoalsAtFrontExperiment = useGoalsFirstExperiment()[ 1 ];
		const userIsLoggedIn = useSelector( isUserLoggedIn );
		const goals = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getGoals(),
			[]
		);

		// we are only interested in the initial values and not when they values change
		const initialGoals = useRef( goals );
		const initialLoggedOut = useRef( ! userIsLoggedIn );

		return useMemo(
			() => ( {
				[ STEPPER_TRACKS_EVENT_SIGNUP_START ]: {
					is_goals_first: isGoalsAtFrontExperiment.toString(),
					...( isGoalsAtFrontExperiment && { step: 'goals' } ),
					is_logged_out: initialLoggedOut.current.toString(),
				},
				[ STEPPER_TRACKS_EVENT_SIGNUP_STEP_START ]: {
					...( isGoalsAtFrontExperiment && {
						is_goals_first: isGoalsAtFrontExperiment.toString(),
					} ),
					...( initialGoals.current.length && {
						goals: initialGoals.current.join( ',' ),
					} ),
				},
			} ),
			[ isGoalsAtFrontExperiment, initialGoals, initialLoggedOut ]
		);
	},
	useSteps() {
		// We have already checked the value has loaded in useAssertConditions
		const [ , isGoalsAtFrontExperiment ] = useGoalsFirstExperiment();

		const steps = stepsWithRequiredLogin( [
			{
				slug: 'domains',
				asyncComponent: () => import( './internals/steps-repository/unified-domains' ),
			},
			{
				slug: 'use-my-domain',
				asyncComponent: () => import( './internals/steps-repository/use-my-domain' ),
			},
			{
				slug: 'plans',
				asyncComponent: () => import( './internals/steps-repository/unified-plans' ),
			},
			{
				slug: 'create-site',
				asyncComponent: () => import( './internals/steps-repository/create-site' ),
			},
			{
				slug: 'processing',
				asyncComponent: () => import( './internals/steps-repository/processing-step' ),
			},
		] );

		if ( isGoalsAtFrontExperiment ) {
			// Note: these steps are not wrapped in `stepsWithRequiredLogin`
			steps.unshift( STEPS.GOALS, STEPS.DESIGN_SETUP, STEPS.DIFM_STARTING_POINT );
		}

		return steps;
	},

	useStepNavigation( currentStepSlug, navigate ) {
		const flowName = this.name;
		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setSiteUrl,
			setSignupDomainOrigin,
		} = useDispatch( ONBOARD_STORE );
		const locale = useFlowLocale();

		const { planCartItem, signupDomainOrigin, isUserLoggedIn } = useSelect(
			( select ) => ( {
				domainCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItem(),
				planCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
				signupDomainOrigin: ( select( ONBOARD_STORE ) as OnboardSelect ).getSignupDomainOrigin(),
				isUserLoggedIn: ( select( USER_STORE ) as UserSelect ).isCurrentUserLoggedIn(),
			} ),
			[]
		);
		const coupon = useQuery().get( 'coupon' );

		const [ redirectedToUseMyDomain, setRedirectedToUseMyDomain ] = useState( false );
		const [ useMyDomainQueryParams, setUseMyDomainQueryParams ] = useState( {} );
		const [ useMyDomainTracksEventProps, setUseMyDomainTracksEventProps ] = useState( {} );

		const [ , isGoalsAtFrontExperiment ] = useGoalsFirstExperiment();

		clearUseMyDomainsQueryParams( currentStepSlug );

		const submit = async ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( currentStepSlug ) {
				case 'goals': {
					const goalsUrl =
						locale && locale !== 'en'
							? `/setup/onboarding/goals/${ locale }`
							: '/setup/onboarding/goals';

					const { intent } = providedDependencies;

					switch ( intent ) {
						case SiteIntent.Import: {
							const migrationFlowLink =
								locale && locale !== 'en'
									? `/setup/hosted-site-migration/${ locale }`
									: '/setup/hosted-site-migration';
							return window.location.assign(
								addQueryArgs( migrationFlowLink, {
									back_to: goalsUrl,
								} )
							);
						}

						case SiteIntent.DIFM:
							return navigate( 'difmStartingPoint' );

						default: {
							return navigate( 'designSetup' );
						}
					}
				}

				case 'designSetup': {
					return navigate( 'domains' );
				}

				case 'difmStartingPoint': {
					const { newOrExistingSiteChoice } = providedDependencies;
					const difmFlowLink = addQueryArgs(
						locale && locale !== 'en' ? `/start/do-it-for-me/${ locale }` : '/start/do-it-for-me',
						{
							back_to: window.location.href.replace( window.location.origin, '' ),
							newOrExistingSiteChoice,
						}
					);

					if ( isUserLoggedIn ) {
						return window.location.assign( difmFlowLink );
					}

					const loginUrl = getLoginUrl( {
						variationName: flowName,
						redirectTo: difmFlowLink,
						locale,
						extra: {
							back_to: window.location.href.replace( window.location.origin, '' ),
						},
					} );

					return window.location.assign( loginUrl );
				}

				case 'domains':
					setSiteUrl( providedDependencies.siteUrl );
					setDomain( providedDependencies.suggestion );
					setDomainCartItem( providedDependencies.domainItem );
					setDomainCartItems( providedDependencies.domainCart );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin );

					if ( providedDependencies.navigateToUseMyDomain ) {
						const currentQueryArgs = getQueryArgs( window.location.href );
						currentQueryArgs.step = 'domain-input';

						setRedirectedToUseMyDomain( true );
						let useMyDomainURL = addQueryArgs( `/use-my-domain`, currentQueryArgs );

						const lastQueryParam = ( providedDependencies?.domainForm as { lastQuery?: string } )
							?.lastQuery;

						if ( lastQueryParam !== undefined ) {
							currentQueryArgs.initialQuery = lastQueryParam;
							useMyDomainURL = addQueryArgs( useMyDomainURL, currentQueryArgs );
						}

						setUseMyDomainTracksEventProps( {
							site_url: providedDependencies.siteUrl,
							signup_domain_origin: signupDomainOrigin,
							domain_item: providedDependencies.domainItem,
						} );
						return navigate( useMyDomainURL );
					}

					setRedirectedToUseMyDomain( false );
					return navigate( 'plans' );
				case 'use-my-domain':
					setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );
					if ( providedDependencies?.mode && providedDependencies?.domain ) {
						setUseMyDomainTracksEventProps( {
							...useMyDomainTracksEventProps,
							signup_domain_origin: SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN,
							site_url: providedDependencies.domain,
						} );
						const destination = addQueryArgs( '/use-my-domain', {
							...getQueryArgs( window.location.href ),
							step: providedDependencies.mode,
							initialQuery: providedDependencies.domain,
						} );
						return navigate( destination );
					}

					// We trigger the event here, because we skip it in the domains step if
					// the user chose use-my-domain
					recordStepNavigation( {
						event: STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT,
						flow: this.name,
						intent: '',
						step: 'domains',
						providedDependencies: useMyDomainTracksEventProps,
					} );

					setUseMyDomainQueryParams( getQueryArgs( window.location.href ) );
					return navigate( 'plans' );
				case 'plans': {
					const cartItems = providedDependencies.cartItems as Array< typeof planCartItem >;
					setPlanCartItem( cartItems?.[ 0 ] ?? null );
					if ( ! cartItems?.[ 0 ] ) {
						// Since we're removing the paid domain, it means that the user chose to continue
						// with a free domain. Because signupDomainOrigin should reflect the last domain
						// selection status before they land on the checkout page, this value can be
						// 'free' or 'choose-later'
						if ( signupDomainOrigin === 'choose-later' ) {
							setSignupDomainOrigin( signupDomainOrigin );
						} else {
							setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.FREE );
						}
					}
					setSignupCompleteFlowName( flowName );
					return navigate( 'create-site', undefined, false );
				}
				case 'create-site':
					return navigate( 'processing', undefined, true );
				case 'processing': {
					const destination = addQueryArgs( '/setup/site-setup', {
						siteSlug: providedDependencies.siteSlug,
						...( isGoalsAtFrontExperiment && { 'goals-at-front-experiment': true } ),
					} );

					persistSignupDestination( destination );
					setSignupCompleteFlowName( flowName );
					setSignupCompleteSlug( providedDependencies.siteSlug );

					if ( providedDependencies.goToCheckout ) {
						const siteSlug = providedDependencies.siteSlug as string;

						// replace the location to delete processing step from history.
						window.location.replace(
							addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
								redirect_to: destination,
								signup: 1,
								checkoutBackUrl: pathToUrl( addQueryArgs( destination, { skippedCheckout: 1 } ) ),
								coupon,
							} )
						);
					} else {
						// replace the location to delete processing step from history.
						window.location.replace( destination );
					}
				}
				default:
					return;
			}
		};

		const goBack = () => {
			switch ( currentStepSlug ) {
				case 'use-my-domain':
					if ( getQueryArg( window.location.href, 'step' ) === 'transfer-or-connect' ) {
						const destination = addQueryArgs( '/use-my-domain', {
							...getQueryArgs( window.location.href ),
							step: 'domain-input',
							initialQuery: getQueryArg( window.location.href, 'initialQuery' ),
						} );
						return navigate( destination );
					}

					if ( window.location.search ) {
						window.history.replaceState( {}, document.title, window.location.pathname );
					}
					return navigate( 'domains' );
				case 'plans':
					if ( redirectedToUseMyDomain ) {
						if ( Object.keys( useMyDomainQueryParams ).length ) {
							// restore query params
							const useMyDomainURL = addQueryArgs( 'use-my-domain', useMyDomainQueryParams );
							return navigate( useMyDomainURL );
						}
						return navigate( 'use-my-domain' );
					}
					return navigate( 'domains' );
				case 'domains':
					if ( isGoalsAtFrontExperiment ) {
						return navigate( 'designSetup' );
					}
				case 'designSetup':
					if ( isGoalsAtFrontExperiment ) {
						return navigate( 'goals' );
					}
				case 'difmStartingPoint':
					return navigate( 'goals' );
				default:
					return;
			}
		};

		return { goBack, submit };
	},
	useAssertConditions() {
		const [ isLoading ] = useGoalsFirstExperiment();

		return {
			state: isLoading ? AssertConditionState.CHECKING : AssertConditionState.SUCCESS,
		};
	},
	useSideEffect( currentStepSlug ) {
		const reduxDispatch = useReduxDispatch();
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );

		/**
		 * Clears every state we're persisting during the flow
		 * when entering it. This is to ensure that the user
		 * starts on a clean slate.
		 */
		useEffect( () => {
			if ( ! currentStepSlug ) {
				resetOnboardStore();
				reduxDispatch( setSelectedSiteId( null ) );
				clearStepPersistedState( this.name );
				clearSignupDestinationCookie();
				clearSignupCompleteFlowName();
				clearSignupCompleteSlug();
			}
		}, [ currentStepSlug, reduxDispatch, resetOnboardStore ] );
	},
};

export default onboarding;
