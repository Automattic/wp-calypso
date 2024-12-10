import { OnboardSelect, Onboard } from '@automattic/data-stores';
import { ONBOARDING_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArg, getQueryArgs, removeQueryArgs } from '@wordpress/url';
import { useState } from 'react';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { pathToUrl } from 'calypso/lib/url';
import {
	persistSignupDestination,
	setSignupCompleteFlowName,
	setSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT } from '../constants';
import { ONBOARD_STORE } from '../stores';
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
			// This step is not wrapped in `stepsWithRequiredLogin`
			steps.unshift( STEPS.GOALS );
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

		const { planCartItem, signupDomainOrigin } = useSelect(
			( select: ( key: string ) => OnboardSelect ) => ( {
				domainCartItem: select( ONBOARD_STORE ).getDomainCartItem(),
				planCartItem: select( ONBOARD_STORE ).getPlanCartItem(),
				signupDomainOrigin: ( select( ONBOARD_STORE ) as OnboardSelect ).getSignupDomainOrigin(),
			} ),
			[]
		);

		const [ redirectedToUseMyDomain, setRedirectedToUseMyDomain ] = useState( false );
		const [ useMyDomainQueryParams, setUseMyDomainQueryParams ] = useState( {} );
		const [ useMyDomainTracksEventProps, setUseMyDomainTracksEventProps ] = useState( {} );

		const [ , isGoalsAtFrontExperiment ] = useGoalsFirstExperiment();

		clearUseMyDomainsQueryParams( currentStepSlug );

		const submit = async ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( currentStepSlug ) {
				case 'goals': {
					const { intent, skip } = providedDependencies;

					if ( skip ) {
						// TODO Implement skipping to dashboard
						return;
					}

					switch ( intent ) {
						case SiteIntent.Import:
							// TODO Implement exit to site migration
							return;

						case SiteIntent.DIFM:
							// TODO Implement exit to DIFM
							return;

						default: {
							return navigate( 'domains' );
						}
					}
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
};

export default onboarding;
