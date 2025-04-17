import { isFreeHostingTrial, isDotComPlan } from '@automattic/calypso-products';
import { NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { useDispatch, useSelect } from '@wordpress/data';
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
import { useDispatch as reduxUseDispatch, useSelector } from 'calypso/state';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { useQuery } from '../../../hooks/use-query';
import { ONBOARD_STORE } from '../../../stores';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { STEPS } from '../../internals/steps';
import { Flow, ProvidedDependencies } from '../../internals/types';
import type { OnboardSelect } from '@automattic/data-stores';

function useShowDomainStep(): boolean {
	const query = useQuery();
	return query.has( 'showDomainStep' );
}

const hosting: Flow = {
	name: NEW_HOSTED_SITE_FLOW,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	useSteps() {
		const showDomainStep = useShowDomainStep();
		return stepsWithRequiredLogin( [
			...( showDomainStep ? [ STEPS.UNIFIED_DOMAINS ] : [] ),
			STEPS.UNIFIED_PLANS,
			STEPS.TRIAL_ACKNOWLEDGE,
			STEPS.SITE_CREATION_STEP,
			STEPS.PROCESSING,
		] );
	},
	useStepNavigation( _currentStepSlug, navigate ) {
		const {
			setDomain,
			setDomainCartItem,
			setDomainCartItems,
			setPlanCartItem,
			setSiteUrl,
			setSignupDomainOrigin,
			resetCouponCode,
		} = useDispatch( ONBOARD_STORE );
		const planCartItem = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getPlanCartItem(),
			[]
		);
		const couponCode = useSelect(
			( select ) => ( select( ONBOARD_STORE ) as OnboardSelect ).getCouponCode(),
			[]
		);

		const query = useQuery();
		const queryParams = Object.fromEntries( query );
		const plan = queryParams.plan;
		const flowName = this.name;
		const showDomainStep = useShowDomainStep();
		const isWooPartner = useIsValidWooPartner();

		const getGoBack = () => {
			if ( _currentStepSlug === STEPS.UNIFIED_PLANS.slug && showDomainStep ) {
				return () => navigate( STEPS.UNIFIED_DOMAINS.slug );
			}

			if ( _currentStepSlug === STEPS.TRIAL_ACKNOWLEDGE.slug ) {
				return () => navigate( STEPS.UNIFIED_PLANS.slug );
			}
		};

		const submit = ( providedDependencies: ProvidedDependencies = {} ) => {
			if ( providedDependencies.siteId ) {
				setSignupCompleteSiteID( providedDependencies.siteId );
			}

			switch ( _currentStepSlug ) {
				case 'domains': {
					setSiteUrl( providedDependencies.siteUrl );
					setDomain( providedDependencies.suggestion );
					setDomainCartItem( providedDependencies.domainItem );
					setDomainCartItems( providedDependencies.domainCart );
					setSignupDomainOrigin( providedDependencies.signupDomainOrigin );

					// If the plan is already supplied as a query param, add it to cart, and skip plans step
					if ( plan && isDotComPlan( { product_slug: plan } ) ) {
						setPlanCartItem( {
							product_slug: plan,
						} );
						return navigate( 'create-site' );
					}
					return navigate( 'plans' );
				}
				case 'plans': {
					const cartItems = providedDependencies.cartItems as Array< typeof planCartItem >;
					const productSlug = cartItems?.[ 0 ]?.product_slug;

					if ( ! productSlug ) {
						throw new Error( 'No product slug found' );
					}

					setPlanCartItem( {
						product_slug: productSlug,
						extra: {
							...( queryParams?.utm_source && {
								hideProductVariants: queryParams.utm_source === 'wordcamp',
							} ),
						},
					} );

					if ( isFreeHostingTrial( productSlug ) ) {
						return navigate( 'trialAcknowledge' );
					}

					setSignupCompleteFlowName( flowName );
					return navigate( 'create-site' );
				}

				case 'trialAcknowledge': {
					return navigate( 'create-site' );
				}

				case 'create-site':
					return navigate( 'processing' );

				case 'processing': {
					const hasStudioSyncSiteId = queryParams.studioSiteId;
					const siteId = providedDependencies.siteId || getSignupCompleteSiteID();
					const siteSlug = providedDependencies.siteSlug || getSignupCompleteSlug();
					const destinationParams: Record< string, string > = {
						siteId,
					};
					if ( hasStudioSyncSiteId ) {
						destinationParams[ 'redirect_to' ] = addQueryArgs( `/home/${ siteId }`, {
							studioSiteId: queryParams.studioSiteId,
						} );
					} else if ( isWooPartner ) {
						// For partners, we'll redirect to the WooCommerce admin page
						destinationParams[
							'redirect_to'
						] = `https://${ siteSlug }/wp-admin/admin.php?page=wc-admin`;
					}
					// Purchasing Business or Commerce plans will trigger an atomic transfer, so go to stepper flow where we wait for it to complete.
					const destination = addQueryArgs( '/setup/transferring-hosted-site', destinationParams );

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

					return navigate( 'plans' );
				}
			}
		};

		return {
			goBack: getGoBack(),
			submit,
		};
	},
	useSideEffect( currentStepSlug, navigate ) {
		const dispatch = reduxUseDispatch();
		const { resetOnboardStore } = useDispatch( ONBOARD_STORE );
		const query = useQuery();
		const isEligible = useSelector( isUserEligibleForFreeHostingTrial );
		// Support for FlowV1 and V2, remove useSteps once FlowV1 is removed.
		const steps = 'useSteps' in this ? this.useSteps() : this.getSteps?.();

		const queryParams = Object.fromEntries( query );

		useEffect( () => {
			if ( currentStepSlug === 'trialAcknowledge' && ! isEligible && steps?.[ 0 ] ) {
				// Go to the first step if the user is not eligible for a free hosting trial
				navigate( steps[ 0 ].slug );
			}
		}, [ isEligible, currentStepSlug, navigate, steps ] );

		useEffect( () => {
			if ( queryParams.studioSiteId ) {
				recordTracksEvent( 'calypso_studio_sync_step', {
					flow: NEW_HOSTED_SITE_FLOW,
					step: currentStepSlug,
				} );
			}
			// eslint-disable-next-line react-hooks/exhaustive-deps
		}, [ currentStepSlug ] );

		useEffect(
			() => {
				if ( ! currentStepSlug ) {
					resetOnboardStore();
				}
				dispatch( setSelectedSiteId( null ) );
			},
			// We only need to reset the store and/or check the `campaign` param when the flow is mounted.
			// eslint-disable-next-line react-hooks/exhaustive-deps
			[]
		);
	},
};

export default hosting;
