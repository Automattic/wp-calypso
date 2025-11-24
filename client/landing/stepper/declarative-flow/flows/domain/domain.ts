import { DotcomFeatures } from '@automattic/api-core';
import { isDomainMapping } from '@automattic/calypso-products';
import { OnboardActions, OnboardSelect } from '@automattic/data-stores';
import {
	DOMAIN_FLOW,
	addPlanToCart,
	addProductsToCart,
	clearStepPersistedState,
} from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useDispatch, useSelect } from '@wordpress/data';
import { addQueryArgs, getQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { hasPlanFeature } from 'calypso/dashboard/utils/site-features';
import { SIGNUP_DOMAIN_ORIGIN } from 'calypso/lib/analytics/signup';
import wpcom from 'calypso/lib/wp';
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
import { useQuery } from '../../../hooks/use-query';
import { useSiteData } from '../../../hooks/use-site-data';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { AssertConditionState, type FlowV2, type SubmitHandler } from '../../internals/types';

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
	useAssertConditions() {
		const { site, siteSlug } = useSiteData();

		if ( ! siteSlug ) {
			return { state: AssertConditionState.SUCCESS };
		}

		return { state: site ? AssertConditionState.SUCCESS : AssertConditionState.CHECKING };
	},
	useStepNavigation( currentStepSlug, navigate ) {
		const {
			setDomainCartItem,
			setDomainCartItems,
			setSiteUrl,
			setSignupDomainOrigin,
			setPlanCartItem,
			setProductCartItems,
			setPendingAction,
			setHideFreePlan,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;

		const { siteSlug, site } = useSiteData();

		const { signupDomainOrigin, domainCartItems } = useSelect(
			( select ) => ( {
				signupDomainOrigin: ( select( ONBOARD_STORE ) as OnboardSelect ).getSignupDomainOrigin(),
				domainCartItems: ( select( ONBOARD_STORE ) as OnboardSelect ).getDomainCartItems(),
			} ),
			[]
		);

		const redirectTo = useQuery().get( 'redirect_to' ) || undefined;
		const defaultRedirect = `/v2/sites/${ siteSlug }/domains`;

		const goToCheckout = ( siteSlug: string ) => {
			const destination = `/v2/sites/${ siteSlug }/domains`;

			// replace the location to delete processing step from history.
			return window.location.replace(
				addQueryArgs( `/checkout/${ encodeURIComponent( siteSlug ) }`, {
					redirect_to: destination,
					signup: 1,
					cancel_to: new URL( addQueryArgs( '/setup/domain', { siteSlug } ), window.location.href )
						.href,
				} )
			);
		};

		const submit: SubmitHandler< typeof initialize > = async ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;
			switch ( slug ) {
				case STEPS.DOMAIN_SEARCH.slug:
					if ( ! providedDependencies ) {
						throw new Error( 'No provided dependencies found' );
					}

					if ( providedDependencies.navigateToUseMyDomain ) {
						const currentQueryArgs = getQueryArgs( window.location.href );

						const useMyDomainURL = addQueryArgs( 'use-my-domain', {
							...currentQueryArgs,
							initialQuery: providedDependencies.lastQuery,
						} );

						return navigate( useMyDomainURL as typeof currentStepSlug );
					}

					setSiteUrl( siteSlug ?? ( providedDependencies.siteUrl as string ) );
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
							redirect_to: redirectTo || defaultRedirect,
							signup: 0,
							cancel_to: new URL(
								addQueryArgs( '/setup/domain', { siteSlug, redirect_to: redirectTo } ),
								window.location.href
							).href,
						} )
					);
				case STEPS.USE_MY_DOMAIN.slug:
					// Handle ownership verification completed
					if (
						providedDependencies &&
						'ownershipVerificationCompleted' in providedDependencies &&
						providedDependencies.ownershipVerificationCompleted &&
						'domain' in providedDependencies
					) {
						const queryArgs = getQueryArgs( window.location.href );
						const domainConnectionSetupUrl = queryArgs.domainConnectionSetupUrl as
							| string
							| undefined;
						window.location.href = domainConnectionSetupUrl
							? domainConnectionSetupUrl.replace( '%s', providedDependencies.domain )
							: defaultRedirect;
					}

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
						return navigate( destination as typeof currentStepSlug );
					}

					// Handle skip to plan when user needs paid plan for ownership verification
					if ( providedDependencies && 'skipToPlan' in providedDependencies ) {
						setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );
						setHideFreePlan( true );
						return navigate( STEPS.UNIFIED_PLANS.slug );
					}

					if ( ! providedDependencies || ! ( 'domainCartItem' in providedDependencies ) ) {
						throw new Error( 'No domain cart item found' );
					}

					if (
						site &&
						siteSlug &&
						providedDependencies &&
						'domainCartItem' in providedDependencies
					) {
						const isDomainMapping =
							providedDependencies.domainCartItem?.product_slug === 'domain_map';
						const mappingIsFree = hasPlanFeature( site, DotcomFeatures.DOMAIN_MAPPING );
						const hasPaidPlan = siteHasPaidPlan( site );

						if ( isDomainMapping && ( mappingIsFree || hasPaidPlan ) ) {
							const queryArgs = getQueryArgs( window.location.href );
							const domainConnectionSetupUrl = queryArgs.domainConnectionSetupUrl as
								| string
								| undefined;
							const domain = providedDependencies.domainCartItem.meta;

							// Use pending action for domain mapping
							// Note: Verification (if required) is handled in the step before submission
							setPendingAction( async () => {
								await wpcom.req.post( `/sites/${ site.ID }/add-domain-mapping`, { domain } );
								/// Redirect to appropriate domains page
								const redirectUrl =
									domainConnectionSetupUrl && domain
										? domainConnectionSetupUrl.replace( '%s', domain )
										: defaultRedirect;
								return {
									redirectTo: redirectUrl,
								};
							} );

							return navigate( STEPS.PROCESSING.slug );
						}

						// Regular flow: add to cart and go through checkout
						setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );
						setHideFreePlan( true );
						setSignupCompleteFlowName( this.name );
						setSignupCompleteSlug( siteSlug );
						setDomainCartItem( providedDependencies.domainCartItem );
						setDomainCartItems( [ providedDependencies.domainCartItem ] );

						if ( ! siteHasPaidPlan( site ) ) {
							return navigate( STEPS.UNIFIED_PLANS.slug );
						}

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

					setSignupDomainOrigin( SIGNUP_DOMAIN_ORIGIN.USE_YOUR_DOMAIN );
					setHideFreePlan( true );
					setDomainCartItem( providedDependencies.domainCartItem );
					setDomainCartItems( [ providedDependencies.domainCartItem ] );

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
						return navigate(
							`${ STEPS.UNIFIED_PLANS.slug }?siteSlug=${ providedDependencies.siteSlug }`
						);
					}

					setPendingAction( async () => {
						if ( domainCartItems ) {
							const hasOnlyDomainMappingInCart =
								domainCartItems.length === 1 && isDomainMapping( domainCartItems[ 0 ] );

							if ( hasOnlyDomainMappingInCart ) {
								const domain = domainCartItems[ 0 ].meta;

								await wpcom.req.post(
									`/sites/${ providedDependencies.site.ID }/add-domain-mapping`,
									{
										domain,
									}
								);

								return {
									redirectTo: `/v2/domains/${ domain }/domain-connection-setup`,
								};
							}

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

					const addOns = products.filter( ( product ) => product !== null );

					setPlanCartItem( pickedPlan );
					// Make sure to put the rest of products into the cart, e.g. the storage add-ons.
					setProductCartItems( addOns );

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

						if ( siteSlug ) {
							return goToCheckout( siteSlug );
						}
					} else if ( siteSlug ) {
						setPendingAction( async () => {
							if ( pickedPlan ) {
								await addPlanToCart( siteSlug, this.name, true, '', pickedPlan );
							}

							if ( addOns.length > 0 ) {
								await addProductsToCart( siteSlug, this.name, addOns );
							}

							if ( domainCartItems ) {
								await addProductsToCart( siteSlug, this.name, domainCartItems );
							}

							return {
								siteSlug,
								goToCheckout: true,
								siteCreated: false,
							};
						} );

						return navigate( STEPS.PROCESSING.slug );
					}

					setSignupCompleteFlowName( this.name );
					return navigate( STEPS.SITE_CREATION_STEP.slug, undefined, false );
				}
				case STEPS.SITE_CREATION_STEP.slug:
					return navigate( STEPS.PROCESSING.slug, undefined, true );
				case STEPS.PROCESSING.slug: {
					if ( providedDependencies.processingResult === ProcessingResult.SUCCESS ) {
						if ( providedDependencies.redirectTo ) {
							return window.location.replace( providedDependencies.redirectTo );
						}

						const destination = `/v2/sites/${ providedDependencies.siteSlug }/domains`;

						persistSignupDestination( destination );
						setSignupCompleteFlowName( this.name );
						setSignupCompleteSlug( providedDependencies.siteSlug );

						if ( providedDependencies.goToCheckout ) {
							return goToCheckout( providedDependencies.siteSlug as string );
						}

						// replace the location to delete processing step from history.
						window.location.replace( destination );
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
		 * Sync site ID from stepper context to Redux store
		 * This ensures components using Redux connect() can access the selected site
		 */
		useEffect( () => {
			if ( siteId ) {
				reduxDispatch( setSelectedSiteId( siteId ) );
			}
		}, [ siteId, reduxDispatch ] );

		/**
		 * Clears every state we're persisting during the flow
		 * when entering it. This is to ensure that the user
		 * starts on a clean slate.
		 */
		useEffect( () => {
			if ( ! currentStepSlug ) {
				resetOnboardStore();
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
