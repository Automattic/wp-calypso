import { OnboardActions, OnboardSelect } from '@automattic/data-stores';
import { DOMAIN_FLOW, addProductsToCart, clearStepPersistedState } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArg, getQueryArgs, removeQueryArgs } from '@wordpress/url';
import { useState, useEffect } from 'react';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import { siteHasPaidPlan } from 'calypso/signup/steps/site-picker/site-picker-submit';
import {
	clearSignupCompleteSlug,
	clearSignupCompleteFlowName,
	clearSignupDestinationCookie,
	clearSignupCompleteSiteID,
	setSignupCompleteFlowName,
	persistSignupDestination,
	setSignupCompleteSlug,
} from 'calypso/signup/storageUtils';
import { useDispatch as useReduxDispatch } from 'calypso/state';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { STEPPER_TRACKS_EVENT_STEP_NAV_SUBMIT } from '../../../constants';
import { useSiteData } from '../../../hooks/use-site-data';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { recordStepNavigation } from '../../internals/analytics/record-step-navigation';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { type FlowV2, type SubmitHandler } from '../../internals/types';

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

function initialize() {
	const steps = [
		STEPS.DOMAIN_SEARCH,
		STEPS.USE_MY_DOMAIN,
		STEPS.NEW_OR_EXISTING_SITE,
		STEPS.SITE_PICKER,
		STEPS.UNIFIED_PLANS,
		STEPS.SITE_CREATION_STEP,
		STEPS.PROCESSING,
	];

	return stepsWithRequiredLogin( steps );
}

/**
 * Domain purchase flow for existing sites (siteSlug query parameter) or domain-only purchases.
 *
 * TODO: Redirect to checkout, and migrate site-or-domain step from Start.
 */
const domain: FlowV2< typeof initialize > = {
	name: DOMAIN_FLOW,
	isSignupFlow: false,
	__experimentalUseBuiltinAuth: true,
	initialize,
	useStepNavigation( currentStepSlug, navigate ) {
		const {
			setDomainCartItem,
			setDomainCartItems,
			setSiteUrl,
			setSignupDomainOrigin,
			setPlanCartItem,
			setProductCartItems,
			setPendingAction,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;

		const { siteSlug, site } = useSiteData();

		const { signupDomainOrigin, domainCartItems } = useSelect(
			( select ) => ( {
				signupDomainOrigin: ( select( ONBOARD_STORE ) as OnboardSelect ).getSignupDomainOrigin(),
				domainCartItems: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItems(),
			} ),
			[]
		);

		const [ useMyDomainTracksEventProps, setUseMyDomainTracksEventProps ] = useState( {} );

		clearUseMyDomainsQueryParams( currentStepSlug );

		const submit: SubmitHandler< typeof initialize > = async ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;
			switch ( slug ) {
				case STEPS.DOMAIN_SEARCH.slug:
					if ( ! providedDependencies ) {
						throw new Error( 'No provided dependencies found' );
					}

					if ( providedDependencies.navigateToUseMyDomain ) {
						const currentQueryArgs = getQueryArgs( window.location.href );
						currentQueryArgs.step = 'domain-input';

						let useMyDomainURL = addQueryArgs( '/use-my-domain', currentQueryArgs );

						const lastQueryParam = providedDependencies.lastQuery;

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

					setSiteUrl( providedDependencies.siteUrl as string );
					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );

					if ( ! site ) {
						return navigate( STEPS.NEW_OR_EXISTING_SITE.slug );
					}

					if ( ! siteHasPaidPlan( site ) ) {
						return navigate( STEPS.UNIFIED_PLANS.slug );
					}

					setSignupCompleteFlowName( this.name );
					setSignupCompleteSlug( siteSlug );

					// replace the location to delete processing step from history.
					return window.location.assign(
						addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
							redirect_to: `/v2/sites/${ siteSlug }/domains`,
							signup: 0,
							cancel_to: new URL(
								addQueryArgs( '/setup/domain', { siteSlug } ),
								window.location.href
							).href,
						} )
					);
				case STEPS.USE_MY_DOMAIN.slug:
					setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );
					if (
						providedDependencies &&
						'mode' in providedDependencies &&
						providedDependencies.mode &&
						providedDependencies.domain
					) {
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

					if ( siteSlug && providedDependencies && 'domainCartItem' in providedDependencies ) {
						setSignupCompleteFlowName( this.name );
						setSignupCompleteSlug( siteSlug );

						setPendingAction( async () => {
							await addProductsToCart( siteSlug, this.name, [
								providedDependencies.domainCartItem,
							] );

							return {
								siteSlug,
								goToCheckout: true,
								siteCreated: false,
							};
						} );

						return navigate( STEPS.PROCESSING.slug );
					}

					return navigate( STEPS.NEW_OR_EXISTING_SITE.slug );

				case STEPS.NEW_OR_EXISTING_SITE.slug:
					if ( providedDependencies.newExistingSiteChoice === 'domain' ) {
						return window.location.assign(
							addQueryArgs( '/checkout/no-site', {
								redirect_to: '/v2/domains',
								signup: 0,
								isDomainOnly: 1,
								cancel_to: new URL(
									addQueryArgs( '/setup/domain/new-or-existing-site', window.location.search ),
									window.location.href
								).href,
							} )
						);
					}

					if ( providedDependencies.newExistingSiteChoice === 'existing-site' ) {
						return navigate( STEPS.SITE_PICKER.slug );
					}

					if ( providedDependencies.newExistingSiteChoice === 'new-site' ) {
						return navigate( STEPS.UNIFIED_PLANS.slug );
					}

					return;

				case STEPS.SITE_PICKER.slug: {
					if ( ! siteHasPaidPlan( providedDependencies.site ) ) {
						return navigate( STEPS.UNIFIED_PLANS.slug );
					}

					setPendingAction( async () => {
						if ( domainCartItems ) {
							await addProductsToCart( providedDependencies.siteSlug, this.name, domainCartItems );
						}

						return {
							siteSlug: providedDependencies.siteSlug,
							goToCheckout: true,
							siteCreated: false,
						};
					} );

					return navigate( STEPS.PROCESSING.slug );
				}

				case STEPS.UNIFIED_PLANS.slug: {
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

					setSignupCompleteFlowName( this.name );
					return navigate( STEPS.SITE_CREATION_STEP.slug, undefined, false );
				}
				case STEPS.SITE_CREATION_STEP.slug:
					return navigate( STEPS.PROCESSING.slug, undefined, true );
				case STEPS.PROCESSING.slug: {
					if ( providedDependencies.processingResult === ProcessingResult.SUCCESS ) {
						const destination = `/v2/sites/${ providedDependencies.siteSlug }/domains`;

						persistSignupDestination( destination );
						setSignupCompleteFlowName( this.name );
						setSignupCompleteSlug( providedDependencies.siteSlug );

						if ( providedDependencies.goToCheckout ) {
							const siteSlug = providedDependencies.siteSlug as string;

							// replace the location to delete processing step from history.
							window.location.replace(
								addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
									redirect_to: destination,
									signup: 1,
									cancel_to: new URL(
										addQueryArgs( '/setup/domain', { siteSlug } ),
										window.location.href
									).href,
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
				default:
					return;
			}
		};

		return { submit };
	},
	useSideEffect( currentStepSlug ) {
		const reduxDispatch = useReduxDispatch();
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const { siteId } = useSiteData();
		/**
		 * Clears every state we're persisting during the flow
		 * when entering it. This is to ensure that the user
		 * starts on a clean slate.
		 */
		useEffect( () => {
			if ( ! currentStepSlug ) {
				resetOnboardStore();
				reduxDispatch( setSelectedSiteId( siteId ) );
				clearStepPersistedState( this.name );
				clearSignupDestinationCookie();
				clearSignupCompleteFlowName();
				clearSignupCompleteSlug();
				clearSignupCompleteSiteID();
			}
		}, [ currentStepSlug, reduxDispatch, resetOnboardStore, siteId ] );
	},
};

export default domain;
