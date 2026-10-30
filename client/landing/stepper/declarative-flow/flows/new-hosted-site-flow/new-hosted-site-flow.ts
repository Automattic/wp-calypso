import { isFreeHostingTrial, isDotComPlan } from '@automattic/calypso-products';
import { getLanguageSlugs } from '@automattic/i18n-utils';
import { clearStepPersistedState, NEW_HOSTED_SITE_FLOW } from '@automattic/onboarding';
import { MinimalRequestCartProduct } from '@automattic/shopping-cart';
import { useDispatch, useSelect, dispatch } from '@wordpress/data';
import { addQueryArgs } from '@wordpress/url';
import { useEffect, useRef } from 'react';
import { useIsValidWooPartner } from 'calypso/landing/stepper/hooks/use-is-valid-woo-partner';
import { recordFreeHostingTrialStarted } from 'calypso/lib/analytics/ad-tracking/ad-track-trial-start';
import { recordTracksEvent } from 'calypso/lib/analytics/tracks';
import { pathToUrl } from 'calypso/lib/url';
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
import { useDispatch as useReduxDispatch, useSelector } from 'calypso/state';
import { isUserEligibleForFreeHostingTrial } from 'calypso/state/selectors/is-user-eligible-for-free-hosting-trial';
import { setSelectedSiteId } from 'calypso/state/ui/actions';
import { useFlowLocale } from '../../../hooks/use-flow-locale';
import { useQuery } from '../../../hooks/use-query';
import { ONBOARD_STORE } from '../../../stores';
import { bindAgentSite, getAgentHandoffId } from '../../../utils/agent-site-handoff';
import { getCurrentQueryParams } from '../../../utils/get-current-query-params';
import { shouldSkipPlansStep } from '../../../utils/preselected-plan';
import { stepsWithRequiredLogin } from '../../../utils/steps-with-required-login';
import { withLocale } from '../../helpers/with-locale';
import { STEPS } from '../../internals/steps';
import { hasPurchaseStepsParameter } from '../../internals/steps-repository/components/onboarding-progress/use-show-onboarding-progress';
import { ProcessingResult } from '../../internals/steps-repository/processing-step/constants';
import { getOnboardingStepperPosition } from '../onboarding/step-counter-config';
import type { FlowV2, SubmitHandler } from '../../internals/types';
import type { DomainSuggestion } from '@automattic/api-core';
import type { OnboardActions, OnboardSelect } from '@automattic/data-stores';
import type { Store } from 'redux';

function initializeSignupState(
	reduxDispatch: Store[ 'dispatch' ],
	queryParams: URLSearchParams,
	eligibleForFreeHostingTrial: boolean,
	shouldReset: boolean
) {
	const { resetOnboardStore, setPlanCartItem } = dispatch( ONBOARD_STORE ) as OnboardActions;
	if ( shouldReset ) {
		resetOnboardStore();
		// @ts-expect-error We're using the thunk middleware but TS doesn't know that.
		reduxDispatch( setSelectedSiteId( null ) );
		clearStepPersistedState( NEW_HOSTED_SITE_FLOW );
		clearSignupDestinationCookie();
		clearSignupCompleteFlowName();
		clearSignupCompleteSlug();
		clearSignupCompleteSiteID();
	}

	const productSlug = getAgentHandoffId( queryParams ) ? null : queryParams.get( 'plan' );
	const utmSource = queryParams.get( 'utm_source' );
	if (
		productSlug &&
		isDotComPlan( { product_slug: productSlug } ) &&
		( ! isFreeHostingTrial( productSlug ) || eligibleForFreeHostingTrial )
	) {
		setPlanCartItem( {
			product_slug: productSlug,
			extra: {
				...( utmSource && { hideProductVariants: utmSource === 'wordcamp' } ),
			},
		} );
	}
}

async function initialize( reduxStore: Store ) {
	const queryParams = getCurrentQueryParams();
	const eligibleForFreeHostingTrial = isUserEligibleForFreeHostingTrial( reduxStore.getState() );

	if ( ! hasPurchaseStepsParameter( queryParams ) ) {
		initializeSignupState( reduxStore.dispatch, queryParams, eligibleForFreeHostingTrial, true );
	}

	const productSlug = getAgentHandoffId( queryParams ) ? null : queryParams.get( 'plan' );
	const steps = [];
	if ( queryParams.has( 'showDomainStep' ) ) {
		steps.push( STEPS.DOMAIN_SEARCH );
	}
	if ( ! productSlug || ! isDotComPlan( { product_slug: productSlug } ) ) {
		steps.push( STEPS.UNIFIED_PLANS, STEPS.TRIAL_ACKNOWLEDGE );
	} else if ( isFreeHostingTrial( productSlug ) ) {
		if ( eligibleForFreeHostingTrial ) {
			steps.push( STEPS.TRIAL_ACKNOWLEDGE, STEPS.UNIFIED_PLANS );
		} else {
			steps.push( STEPS.UNIFIED_PLANS );
		}
	}
	steps.push( STEPS.SITE_CREATION_STEP, STEPS.PROCESSING );
	if ( getAgentHandoffId( queryParams ) ) {
		steps.push( STEPS.ERROR );
	}

	return stepsWithRequiredLogin( steps );
}

const hosting: FlowV2< typeof initialize > = {
	name: NEW_HOSTED_SITE_FLOW,
	__experimentalUseBuiltinAuth: true,
	isSignupFlow: true,
	initialize,
	useStepsProps() {
		const query = useQuery();
		return getAgentHandoffId( query ) ? { plans: { defaultInterval: 'monthly' } } : {};
	},
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

		const locale = useFlowLocale();
		const utmSource = query.get( 'utm_source' );
		const studioSiteId = query.get( 'studioSiteId' );
		const agentHandoffId = getAgentHandoffId( query );
		const autoOpenPush = query.get( 'autoOpenPush' );

		const flowName = this.name;
		const showPurchaseSteps = hasPurchaseStepsParameter( query );
		const showDomainStep = query.has( 'showDomainStep' );
		const shouldSkipPlans =
			! getAgentHandoffId( query ) &&
			shouldSkipPlansStep( query, planCartItem, NEW_HOSTED_SITE_FLOW );
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

					if ( showPurchaseSteps ? shouldSkipPlans : planCartItem ) {
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
					return navigate( STEPS.PROCESSING.slug, undefined, showPurchaseSteps );

				case STEPS.PROCESSING.slug: {
					if (
						agentHandoffId &&
						providedDependencies.processingResult !== ProcessingResult.SUCCESS
					) {
						return navigate( STEPS.ERROR.slug );
					}
					if ( providedDependencies.processingResult === ProcessingResult.SUCCESS ) {
						const siteId = providedDependencies.siteId || getSignupCompleteSiteID();
						const continueAfterBind = () => {
							setSignupCompleteSiteID( showPurchaseSteps ? siteId : providedDependencies.siteId );
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
							const destination = agentHandoffId
								? addQueryArgs(
										`/checkout/thank-you/${ encodeURIComponent( siteSlug || 'no-site' ) }/:receiptId`,
										{ agentHandoffId }
									)
								: addQueryArgs( '/setup/transferring-hosted-site', destinationParams );

							// If the product is a free trial, record the trial start event for ad tracking.
							if ( planCartItem && isFreeHostingTrial( planCartItem?.product_slug ) ) {
								recordFreeHostingTrialStarted( flowName );
							}

							if ( providedDependencies.goToCheckout ) {
								persistSignupDestination( destination );
								setSignupCompleteSlug( providedDependencies?.siteSlug );
								setSignupCompleteFlowName( flowName );

								if ( couponCode ) {
									resetCouponCode();
								}
								const checkoutBackUrl = ( step: 'domains' | 'plans' ) =>
									pathToUrl(
										addQueryArgs( withLocale( `/setup/${ flowName }/${ step }`, locale ), {
											...Object.fromEntries( query ),
											plan: undefined,
											siteSlug,
										} )
									);
								const stepPosition = getOnboardingStepperPosition( 'checkout', shouldSkipPlans );
								const checkoutUrl = addQueryArgs(
									`/checkout/${ encodeURIComponent( ( providedDependencies?.siteSlug as string ) ?? '' ) }`,
									{
										redirect_to: destination,
										...( agentHandoffId && {
											cancel_to: addQueryArgs( '/setup/new-hosted-site/plans', { agentHandoffId } ),
										} ),
										coupon: couponCode,
										...( showPurchaseSteps && {
											showDomainStep: '',
											showPurchaseSteps: 'true',
											checkoutBackUrl: checkoutBackUrl( shouldSkipPlans ? 'domains' : 'plans' ),
											checkoutBackUrlDomains: checkoutBackUrl( 'domains' ),
											steps_current: stepPosition.current,
											steps_total: stepPosition.total,
										} ),
									}
								);
								return showPurchaseSteps
									? window.location.replace( checkoutUrl )
									: window.location.assign( checkoutUrl );
							}

							return navigate( STEPS.UNIFIED_PLANS.slug );
						};
						if ( agentHandoffId ) {
							const numericSiteId = Number( siteId );
							if ( ! Number.isSafeInteger( numericSiteId ) || numericSiteId <= 0 ) {
								throw new Error( 'Site handoff could not be confirmed' );
							}
							return bindAgentSite( agentHandoffId, numericSiteId )
								.then( continueAfterBind )
								.catch( () => navigate( STEPS.ERROR.slug ) );
						}
						return continueAfterBind();
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
		const reduxDispatch = useReduxDispatch();
		const eligibleForFreeHostingTrial = useSelector( isUserEligibleForFreeHostingTrial );
		const signupStateInitialized = useRef( false );
		useEffect( () => {
			if ( signupStateInitialized.current ) {
				return;
			}
			signupStateInitialized.current = true;
			const query = getCurrentQueryParams();
			if ( hasPurchaseStepsParameter( query ) ) {
				initializeSignupState(
					reduxDispatch,
					query,
					eligibleForFreeHostingTrial,
					! currentStepSlug || getLanguageSlugs().includes( currentStepSlug )
				);
			}
		}, [ currentStepSlug, reduxDispatch, eligibleForFreeHostingTrial ] );

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
