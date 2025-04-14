import { OnboardSelect } from '@automattic/data-stores';
import { ONBOARDING_FLOW, clearStepPersistedState } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArg, getQueryArgs, removeQueryArgs } from '@wordpress/url';
import { useState, useEffect } from 'react';
import { useIsPlaygroundEligible } from 'calypso/landing/stepper/hooks/use-is-playground-eligible';
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
import { useMarketplaceThemeProducts } from '../../../hooks/use-marketplace-theme-products';
import { useQuery } from '../../../hooks/use-query';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { useRedirectDesignSetupOldSlug } from '../../helpers/use-redirect-design-setup-old-slug';
import { recordStepNavigation } from '../../internals/analytics/record-step-navigation';
import { STEPS } from '../../internals/steps';
import { Flow, ProvidedDependencies } from '../../internals/types';

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

const onboarding: Flow = {
	name: ONBOARDING_FLOW,
	isSignupFlow: true,
	__experimentalUseBuiltinAuth: true,
	useSteps() {
		const isPlaygroundEligible = useIsPlaygroundEligible();

		const steps = stepsWithRequiredLogin( [
			STEPS.UNIFIED_DOMAINS,
			STEPS.USE_MY_DOMAIN,
			STEPS.UNIFIED_PLANS,
			STEPS.SITE_CREATION_STEP,
			STEPS.PROCESSING,
			STEPS.POST_CHECKOUT_ONBOARDING,
		] );

		if ( isPlaygroundEligible ) {
			steps.push( STEPS.PLAYGROUND );
		}

		return steps;
	},

	useStepNavigation( currentStepSlug, navigate ) {
		const flowName = this.name;
		const isPlaygroundEligible = useIsPlaygroundEligible();
		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setProductCartItems,
			setSiteUrl,
			setSignupDomainOrigin,
		} = useDispatch( ONBOARD_STORE );
		const locale = useFlowLocale();

		const { planCartItem, signupDomainOrigin } = useSelect(
			( select ) => ( {
				planCartItem: ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
				signupDomainOrigin: ( select( ONBOARD_STORE ) as OnboardSelect ).getSignupDomainOrigin(),
			} ),
			[]
		);
		const coupon = useQuery().get( 'coupon' );

		const [ useMyDomainTracksEventProps, setUseMyDomainTracksEventProps ] = useState( {} );

		const { selectedMarketplaceProduct } = useMarketplaceThemeProducts();

		/**
		 * Returns [destination, backDestination] for the post-checkout destination.
		 */
		const getPostCheckoutDestination = (
			providedDependencies: ProvidedDependencies,
			isPlaygroundEligible: boolean
		): [ string, string | null ] => {
			if ( ! providedDependencies.hasExternalTheme && providedDependencies.hasPluginByGoal ) {
				return [ `/home/${ providedDependencies.siteSlug }`, null ];
			}

			const playgroundId = isPlaygroundEligible
				? getQueryArg( window.location.href, 'playground' )
				: null;
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

			const destination = addQueryArgs( withLocale( '/setup/site-setup', locale ), {
				siteSlug: providedDependencies.siteSlug,
			} );

			return [ destination, addQueryArgs( destination, { skippedCheckout: 1 } ) ];
		};

		clearUseMyDomainsQueryParams( currentStepSlug );
		useRedirectDesignSetupOldSlug( currentStepSlug, navigate );

		const submit = async ( providedDependencies: ProvidedDependencies = {} ) => {
			switch ( currentStepSlug ) {
				case 'domains':
					setSiteUrl( providedDependencies.siteUrl );
					setDomain( providedDependencies.suggestion );
					setDomainCartItem( providedDependencies.domainItem );
					setDomainCartItems( providedDependencies.domainCart );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin );

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
						return navigate( useMyDomainURL );
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

					// Make sure to put the rest of products into the cart, e.g. the storage add-ons.
					setProductCartItems( [
						...( selectedMarketplaceProduct ? [ selectedMarketplaceProduct ] : [] ),
						...( cartItems || [] ).slice( 1 ),
					] );

					setSignupCompleteFlowName( flowName );
					return navigate( 'create-site', undefined, false );
				}
				case 'create-site':
					return navigate( 'processing', undefined, true );
				case 'post-checkout-onboarding':
					return navigate( 'processing' );
				case 'processing': {
					const [ destination, backDestination ] = getPostCheckoutDestination(
						providedDependencies,
						isPlaygroundEligible
					);

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
							: addQueryArgs( withLocale( '/setup/onboarding/post-checkout-onboarding', locale ), {
									siteSlug,
							  } );

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
