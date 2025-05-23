import { isEnabled } from '@automattic/calypso-config';
import { DomainSuggestion, OnboardActions, OnboardSelect } from '@automattic/data-stores';
import { ONBOARDING_FLOW, clearStepPersistedState } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArg, getQueryArgs, removeQueryArgs } from '@wordpress/url';
import { useState, useEffect } from 'react';
import { isMvpOnboardingExperiment } from 'calypso/landing/stepper/hooks/use-mvp-onboarding-experiment';
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
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT } from '../../../constants';
import { useFlowLocale } from '../../../hooks/use-flow-locale';
import { useQuery } from '../../../hooks/use-query';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { recordStepNavigation } from '../../internals/analytics/record-step-navigation';
import { usePurchasePlanNotification } from '../../internals/hooks/use-purchase-plan-notification';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { FlowV2, ProvidedDependencies, SubmitHandler } from '../../internals/types';

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

const withLocale = ( url: string, locale: string ) => {
	return locale && locale !== 'en' ? `${ url }/${ locale }` : url;
};

function initialize() {
	const steps = [
		STEPS.UNIFIED_DOMAINS,
		STEPS.USE_MY_DOMAIN,
		STEPS.UNIFIED_PLANS,
		STEPS.SITE_CREATION_STEP,
		STEPS.PROCESSING,
		STEPS.POST_CHECKOUT_ONBOARDING,
		STEPS.PLAYGROUND,
	];

	return stepsWithRequiredLogin( steps );
}

const onboarding: FlowV2< typeof initialize > = {
	name: ONBOARDING_FLOW,
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	initialize,
	useStepNavigation( currentStepSlug, navigate ) {
		const flowName = this.name;

		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setProductCartItems,
			setSiteUrl,
			setSignupDomainOrigin,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const locale = useFlowLocale();

		const { signupDomainOrigin } = useSelect(
			( select ) => ( {
				signupDomainOrigin: ( select( ONBOARD_STORE ) as OnboardSelect ).getSignupDomainOrigin(),
			} ),
			[]
		);
		const coupon = useQuery().get( 'coupon' );

		const [ useMyDomainTracksEventProps, setUseMyDomainTracksEventProps ] = useState( {} );
		const { setShouldShowNotification } = usePurchasePlanNotification();

		/**
		 * Returns [destination, backDestination] for the post-checkout destination.
		 */
		const getPostCheckoutDestination = async (
			providedDependencies: ProvidedDependencies
		): Promise< [ string, string | null ] > => {
			if ( ! providedDependencies.hasExternalTheme && providedDependencies.hasPluginByGoal ) {
				return [ `/home/${ providedDependencies.siteSlug }`, null ];
			}

			const playgroundId = getQueryArg( window.location.href, 'playground' );
			if ( playgroundId && providedDependencies.siteSlug ) {
				return [
					addQueryArgs( withLocale( '/setup/site-setup/importerPlayground', locale ), {
						siteSlug: providedDependencies.siteSlug,
						siteId: providedDependencies.siteId,
						playground: playgroundId,
					} ),
					null,
				];
			}

			/**
			 * If the dashboard/v2/onboarding feature flag is enabled, we'll redirect the user to the new hosting Dashboard.
			 * We aren't using the dashboard/v2 FF because it's enabled by default on wpcalypso.json which would break e2e tests.
			 * Since we're aiming to remove steps after the isMvpOnboarding experiment ends,
			 * we'll redirect the user to the new Dashboard here.
			 */
			if ( isEnabled( 'dashboard/v2/onboarding' ) ) {
				return [
					addQueryArgs( `/v2/sites/${ providedDependencies.siteSlug }`, { ref: flowName } ),
					addQueryArgs( withLocale( `/setup/${ flowName }/plans`, locale ), {
						siteSlug: providedDependencies.siteSlug,
					} ),
				];
			}

			if ( await isMvpOnboardingExperiment() ) {
				return [
					addQueryArgs( `/home/${ providedDependencies.siteSlug }`, { ref: flowName } ),
					addQueryArgs( withLocale( `/setup/${ flowName }/plans`, locale ), {
						siteSlug: providedDependencies.siteSlug,
					} ),
				];
			}

			const destination = addQueryArgs( withLocale( '/setup/site-setup', locale ), {
				siteSlug: providedDependencies.siteSlug,
			} );

			return [ destination, addQueryArgs( destination, { skippedCheckout: 1 } ) ];
		};

		clearUseMyDomainsQueryParams( currentStepSlug );

		const submit: SubmitHandler< typeof initialize > = async ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;
			switch ( slug ) {
				case 'domains':
					setSiteUrl( providedDependencies.siteUrl as string );
					setDomain( providedDependencies.suggestion as DomainSuggestion );
					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );

					if ( providedDependencies.navigateToUseMyDomain ) {
						const currentQueryArgs = getQueryArgs( window.location.href );
						currentQueryArgs.step = 'domain-input';

						let useMyDomainURL = addQueryArgs( '/use-my-domain', currentQueryArgs );

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
						return navigate( useMyDomainURL as typeof currentStepSlug );
					}

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
						return navigate( destination as typeof currentStepSlug );
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

					return navigate( 'plans' );
				case 'plans': {
					const cartItems = providedDependencies.cartItems;
					const [ pickedPlan, ...products ] = cartItems ?? [];

					setPlanCartItem( pickedPlan );

					if ( ! pickedPlan ) {
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

					// Make sure to put the rest of products into the cart, e.g. the storage add-ons.
					setProductCartItems( products.filter( ( product ) => product !== null ) );

					setSignupCompleteFlowName( flowName );
					return navigate( 'create-site', undefined, false );
				}
				case 'create-site':
					return navigate( 'processing', undefined, true );
				case 'post-checkout-onboarding':
					setShouldShowNotification( providedDependencies?.siteId as number );
					return navigate( 'processing' );
				case 'processing': {
					const [ destination, backDestination ] =
						await getPostCheckoutDestination( providedDependencies );
					if ( providedDependencies.processingResult === ProcessingResult.SUCCESS ) {
						persistSignupDestination( destination );
						setSignupCompleteFlowName( flowName );
						setSignupCompleteSlug( providedDependencies.siteSlug );

						if ( providedDependencies.goToCheckout ) {
							const siteSlug = providedDependencies.siteSlug as string;

							/**
							 * If the user comes from the Playground onboarding flow,
							 * redirect the user back to Playground to start the import.
							 */
							const playgroundId = getQueryArg( window.location.href, 'playground' );
							const redirectTo: string = playgroundId
								? addQueryArgs( withLocale( '/setup/site-setup/importerPlayground', locale ), {
										siteSlug,
										siteId: providedDependencies.siteId,
										playground: playgroundId,
								  } )
								: addQueryArgs(
										withLocale( '/setup/onboarding/post-checkout-onboarding', locale ),
										{
											siteSlug,
										}
								  );

							// replace the location to delete processing step from history.
							window.location.replace(
								addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
									redirect_to: redirectTo,
									signup: 1,
									checkoutBackUrl: pathToUrl( backDestination ?? '' ),
									coupon,
								} )
							);
						} else {
							// replace the location to delete processing step from history.
							window.location.replace( destination );
						}
					} else {
						// TODO: Handle errors
						// navigate( 'error' );
					}
					return;
				}
				case 'playground':
					return navigate( 'domains' );
				default:
					return;
			}
		};

		return { submit };
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
