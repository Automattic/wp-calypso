import { isFreeHostingTrial, isDotComPlan } from '@automattic/calypso-products';
import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
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
} from 'calypso/signup/storageUtils';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { useQuery } from '../../../hooks/use-query';
import { ONBOARD_STORE } from '../../../stores';
import { getCurrentQueryParams } from '../../../utils/get-current-query-params';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { DomainSuggestion, OnboardActions, OnboardSelect } from '@automattic/data-stores';
import type { Store } from 'redux';

async function initialize( reduxStore: Store ) {
	const { resetOnboardStore, setPlanCartItem } = dispatch( ONBOARD_STORE ) as OnboardActions;

	await resetOnboardStore();

	const queryParams = getCurrentQueryParams();
	const showDomainStep = queryParams.has( 'showDomainStep' );
	const productSlug = queryParams.get( 'plan' );

	const eligibleForFreeHostingTrial = isUserEligibleForFreeHostingTrial( reduxStore.getState() );

	const steps = [];

	if ( showDomainStep ) {
		steps.push( STEPS.UNIFIED_DOMAINS );
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
	useStepNavigation( _currentStepSlug, navigate ) {
		const {
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

		const flowName = this.name;
		const showDomainStep = query.has( 'showDomainStep' );
		const isWooPartner = useIsValidWooPartner();

		const getGoBack = () => {
			if ( _currentStepSlug === STEPS.UNIFIED_PLANS.slug && showDomainStep ) {
				return () => navigate( STEPS.UNIFIED_DOMAINS.slug );
			}

			if ( _currentStepSlug === STEPS.TRIAL_ACKNOWLEDGE.slug ) {
				return () => navigate( STEPS.UNIFIED_PLANS.slug );
			}
		};

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.UNIFIED_DOMAINS.slug: {
					setSiteUrl( providedDependencies.siteUrl as string );
					setDomain( providedDependencies.suggestion as DomainSuggestion );
					setDomainCartItem( providedDependencies.domainItem as MinimalRequestCartProduct );
					setDomainCartItems( providedDependencies.domainCart as MinimalRequestCartProduct[] );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin as string );

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
						setSignupCompleteSiteID( providedDependencies.siteId );
						const siteSlug = providedDependencies.siteSlug || getSignupCompleteSlug();
						const destinationParams: Record< string, string > = {
							siteId,
						};
						if ( studioSiteId ) {
							destinationParams[ 'redirect_to' ] = addQueryArgs( `/home/${ siteId }`, {
								studioSiteId,
							} );
						} else if ( isWooPartner ) {
							// For partners, we'll redirect to the WooCommerce admin page
							destinationParams[
								'redirect_to'
							] = `https://${ siteSlug }/wp-admin/admin.php?page=wc-admin`;
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
							setSignupCompleteSlug( providedDependencies?.siteSlug );
							setSignupCompleteFlowName( flowName );

							couponCode && resetCouponCode();
							return window.location.assign(
								addQueryArgs(
									`/checkout/${ encodeURIComponent(
										( providedDependencies?.siteSlug as string ) ?? ''
									) }`,
									{ redirect_to: destination, coupon: couponCode }
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
		const studioSiteId = useQuery().get( 'studioSiteId' );

		useEffect( () => {
			if ( studioSiteId ) {
				recordTracksEvent( 'calypso_studio_sync_step', {
					flow: NEW_HOSTED_SITE_FLOW,
					step: currentStepSlug,
				} );
			}
		}, [ currentStepSlug, studioSiteId ] );
	},
};

export default hosting;
