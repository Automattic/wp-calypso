import { isFreeHostingTrial, isDotComPlan } from '@automattic/calypso-products';
import { clearStepPersistedState, NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useDispatch, useSelect, dispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect } from 'react';
import { useIsValidWooPartner } from 'calypso/landing/stepper/hooks/use-is-valid-woo-partner';
import { recordFreeHostingTrialStarted } from 'calypso/lib/analytics/ad-tracking/ad-track-trial-start';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import {
	setSignupCompleteSlug,
	persistSignupDestination,
	setSignupCompleteFlowName,
	getSignupCompleteSiteID,
	setSignupCompleteSiteID,
	getSignupCompleteSlug,
	clearSignupDestinationCookie,
	clearSignupCompleteFlowName,
	clearSignupCompleteSlug,
	clearSignupCompleteSiteID,
} from 'calypso/signup/storageUtils';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { useQuery } from '../../../hooks/use-query';
import { ONBOARD_STORE } from '../../../stores';
import { getCurrentQueryParams } from '../../../utils/get-current-query-params';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { getOnboardingStepperPosition } from '../onboarding/step-counter-config';
import { hasCommercePurchaseSteps, isCommercePurchaseResume } from './commerce-purchase-steps';
import { resumeCommerceCart } from './resume-commerce-cart';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { DomainSuggestion } from '@automattic/api-core';
import type { OnboardActions, OnboardSelect } from '@automattic/data-stores';
import type { Store } from 'redux';

async function initialize( reduxStore: Store ) {
	const { resetOnboardStore, setPlanCartItem } = dispatch( ONBOARD_STORE ) as OnboardActions;

	await resetOnboardStore();
	// @ts-expect-error We're using the thunk middleware but TS doesn't know that.
	reduxStore.dispatch( setSelectedSiteId( null ) );
	clearStepPersistedState( NEW_HOSTED_SITE_FLOW );
	const queryParams = getCurrentQueryParams();
	if ( ! isCommercePurchaseResume( NEW_HOSTED_SITE_FLOW, queryParams ) ) {
		clearSignupDestinationCookie();
		clearSignupCompleteFlowName();
		clearSignupCompleteSlug();
		clearSignupCompleteSiteID();
	}
	const showDomainStep = queryParams.has( 'showDomainStep' );
	const productSlug = queryParams.get( 'plan' );

	const eligibleForFreeHostingTrial = isUserEligibleForFreeHostingTrial( reduxStore.getState() );

	const steps = [];

	if ( showDomainStep ) {
		steps.push( STEPS.DOMAIN_SEARCH );
	}

	const utmSource = queryParams.get( 'utm_source' );

	if ( ! productSlug || ! isDotComPlan( { product_slug: productSlug } ) ) {
		steps.push( STEPS.UNIFIED_PLANS, STEPS.TRIAL_ACKNOWLEDGE );
	} else if ( ! isFreeHostingTrial( productSlug ) ) {
		await setPlanCartItem( {
			product_slug: productSlug,
			extra: {
				...( utmSource && {
					hideProductVariants: utmSource === 'wordcamp',
				} ),
			},
		} );
	} else if ( eligibleForFreeHostingTrial ) {
		await setPlanCartItem( {
			product_slug: productSlug,
			extra: {
				...( utmSource && {
					hideProductVariants: utmSource === 'wordcamp',
				} ),
			},
		} );

		steps.push( STEPS.TRIAL_ACKNOWLEDGE, STEPS.UNIFIED_PLANS );
	} else {
		steps.push( STEPS.UNIFIED_PLANS );
	}

	steps.push( STEPS.SITE_CREATION_STEP, STEPS.PROCESSING );

	return stepsWithRequiredLogin( steps );
}

const hosting: FlowV2< typeof initialize > = {
	name: NEW_HOSTED_SITE_FLOW,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	initialize,
	useStepsProps() {
		return {
			[ STEPS.DOMAIN_SEARCH.slug ]: {
				shouldHidePlansStep: hasCommercePurchaseSteps( this.name, useQuery() ),
			},
		};
	},
	useStepNavigation( _currentStepSlug, navigate ) {
		const {
			setPendingAction,
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setProductCartItems,
			setSiteUrl,
			setSignupDomainOrigin,
			resetCouponCode,
		} = useDispatch( ONBOARD_STORE ) as OnboardActions;
		const planCartItem = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			[]
		);
		const couponCode = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getCouponCode(),
			[]
		);

		const query = useQuery();

		const utmSource = query.get( 'utm_source' );
		const studioSiteId = query.get( 'studioSiteId' );
		const autoOpenPush = query.get( 'autoOpenPush' );

		const flowName = this.name;
		const showDomainStep = query.has( 'showDomainStep' );
		const commercePurchaseSteps = hasCommercePurchaseSteps( flowName, query );
		const isWooPartner = useIsValidWooPartner();

		const getGoBack = () => {
			if ( _currentStepSlug === STEPS.UNIFIED_PLANS.slug && showDomainStep ) {
				return () => navigate( STEPS.DOMAIN_SEARCH.slug );
			}

			if ( _currentStepSlug === STEPS.TRIAL_ACKNOWLEDGE.slug ) {
				return () => navigate( STEPS.UNIFIED_PLANS.slug );
			}
		};

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.DOMAIN_SEARCH.slug: {
					if ( ! providedDependencies ) {
						throw new Error( 'No provided dependencies found' );
					}

					if ( providedDependencies.navigateToUseMyDomain ) {
						throw new Error( 'Navigation to use my domain is not supported for this flow' );
					}

					setSiteUrl( providedDependencies.siteUrl as string );
					setDomain( providedDependencies.suggestion as DomainSuggestion );
					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );

					if ( planCartItem && isCommercePurchaseResume( flowName, query ) ) {
						const siteSlug = query.get( 'siteSlug' )!;
						const siteId = query.get( 'siteId' )!;
						setPendingAction( async () => {
							await resumeCommerceCart(
								siteSlug,
								planCartItem,
								( providedDependencies.domainCart as MinimalRequestCartProduct[] ) ?? []
							);
							return { siteId, siteSlug, goToCheckout: true, siteCreated: true };
						} );
						return navigate( STEPS.PROCESSING.slug );
					}

					if ( planCartItem ) {
						return navigate( STEPS.SITE_CREATION_STEP.slug );
					}

					return navigate( STEPS.UNIFIED_PLANS.slug );
				}
				case STEPS.UNIFIED_PLANS.slug: {
					const cartItems = providedDependencies.cartItems;
					const [ pickedPlan, ...extraProducts ] = cartItems ?? [];

					if ( ! pickedPlan ) {
						throw new Error( 'No product slug found' );
					}

					setPlanCartItem( {
						...pickedPlan,
						extra: {
							...pickedPlan.extra,
							...( utmSource && {
								hideProductVariants: utmSource === 'wordcamp',
							} ),
						},
					} );

					setProductCartItems( extraProducts.filter( ( product ) => product !== null ) );

					if ( isFreeHostingTrial( pickedPlan.product_slug ) ) {
						return navigate( STEPS.TRIAL_ACKNOWLEDGE.slug );
					}

					setSignupCompleteFlowName( flowName );
					return navigate( STEPS.SITE_CREATION_STEP.slug );
				}

				case STEPS.TRIAL_ACKNOWLEDGE.slug: {
					return navigate( STEPS.SITE_CREATION_STEP.slug );
				}

				case STEPS.SITE_CREATION_STEP.slug:
					return navigate( STEPS.PROCESSING.slug );

				case STEPS.PROCESSING.slug: {
					if ( providedDependencies.processingResult === ProcessingResult.SUCCESS ) {
						const siteId = providedDependencies.siteId || getSignupCompleteSiteID();
						setSignupCompleteSiteID( commercePurchaseSteps ? siteId : providedDependencies.siteId );
						const siteSlug = providedDependencies.siteSlug || getSignupCompleteSlug();
						const destinationParams: Record< string, string > = {
							siteId,
							...( siteSlug ? { siteSlug } : {} ),
						};
						if ( studioSiteId ) {
							destinationParams[ 'redirect_to' ] = addQueryArgs( `/home/${ siteId }`, {
								studioSiteId,
								...( autoOpenPush === 'true' && { autoOpenPush: 'true' } ),
							} );
						} else if ( isWooPartner ) {
							// For partners, we'll redirect to the WooCommerce admin page
							destinationParams[ 'redirect_to' ] =
								`https://${ siteSlug }/wp-admin/admin.php?page=wc-admin`;
						}
						// Purchasing Business or Commerce plans will trigger an atomic transfer, so go to stepper flow where we wait for it to complete.
						const destination = addQueryArgs(
							'/setup/transferring-hosted-site',
							destinationParams
						);

						// If the product is a free trial, record the trial start event for ad tracking.
						if ( planCartItem && isFreeHostingTrial( planCartItem?.product_slug ) ) {
							recordFreeHostingTrialStarted( flowName );
						}

						if ( providedDependencies.goToCheckout ) {
							persistSignupDestination( destination );
							setSignupCompleteSlug(
								commercePurchaseSteps ? siteSlug : providedDependencies?.siteSlug
							);
							setSignupCompleteFlowName( flowName );

							if ( couponCode ) {
								resetCouponCode();
							}
							const backUrl = new URL(
								addQueryArgs( '/setup/new-hosted-site/domains', {
									...Object.fromEntries( query ),
									siteId,
									siteSlug,
								} ),
								window.location.origin
							).href;
							const stepPosition = getOnboardingStepperPosition( 'checkout', true );
							if ( commercePurchaseSteps ) {
								// Browser Back must resume domains rather than rerun site creation.
								window.history.replaceState( window.history.state, '', backUrl );
							}
							return window.location.assign(
								addQueryArgs(
									`/checkout/${ encodeURIComponent(
										( commercePurchaseSteps
											? siteSlug
											: ( providedDependencies?.siteSlug as string ) ) ?? ''
									) }`,
									{
										redirect_to: destination,
										coupon: couponCode,
										...( commercePurchaseSteps && {
											flow: NEW_HOSTED_SITE_FLOW,
											showPurchaseSteps: 'true',
											plan: query.get( 'plan' ),
											showDomainStep: '',
											signup: 1,
											checkoutBackUrl: backUrl,
											checkoutBackUrlDomains: backUrl,
											steps_current: stepPosition.current,
											steps_total: stepPosition.total,
										} ),
									}
								)
							);
						}

						return navigate( STEPS.UNIFIED_PLANS.slug );
					}
				}
			}
		};

		return {
			goBack: getGoBack(),
			submit,
		};
	},
	useSideEffect( currentStepSlug ) {
		const commercePurchaseSteps = hasCommercePurchaseSteps( NEW_HOSTED_SITE_FLOW, useQuery() );
		useEffect( () => {
			if ( ! commercePurchaseSteps ) {
				return;
			}
			const restorePage = ( event: PageTransitionEvent ) => {
				if ( event.persisted ) {
					// A cached processing page must remount at its domain-return URL.
					window.location.reload();
				}
			};
			window.addEventListener( 'pageshow', restorePage );
			return () => window.removeEventListener( 'pageshow', restorePage );
		}, [ commercePurchaseSteps ] );
		const studioSiteId = useQuery().get( 'studioSiteId' );
		const autoOpenPush = useQuery().get( 'autoOpenPush' );
		const section = useQuery().get( 'section' );
		useEffect( () => {
			if ( studioSiteId && currentStepSlug ) {
				recordTracksEvent( 'calypso_studio_sync_step', {
					flow: NEW_HOSTED_SITE_FLOW,
					step: currentStepSlug,
					section: section || undefined,
					auto_open_push: autoOpenPush === 'true',
				} );
			}
		}, [ currentStepSlug, studioSiteId, autoOpenPush, section ] );
	},
};

export default hosting;
