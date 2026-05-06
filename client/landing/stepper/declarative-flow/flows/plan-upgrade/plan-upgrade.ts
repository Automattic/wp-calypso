import { getPlan, getIntervalTypeForTerm } from '@automattic/calypso-products';
import { Plans } from '@automattic/data-stores';
import { PLAN_UPGRADE_FLOW } from '@automattic/onboarding';
import { resolveSelect, useSelect } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { addQueryArgs } from '@wordpress/url';
import { dashboardLink, dashboardOrigins } from 'calypso/dashboard/utils/link';
import { STEPS } from 'calypso/landing/stepper/declarative-flow/internals/steps';
import { FlowV2, SubmitHandler } from 'calypso/landing/stepper/declarative-flow/internals/types';
import { useQuery } from 'calypso/landing/stepper/hooks/use-query';
import { SITE_STORE } from 'calypso/landing/stepper/stores';
import { getCurrentQueryParams } from 'calypso/landing/stepper/utils/get-current-query-params';
import { stepsWithRequiredLogin } from 'calypso/landing/stepper/utils/steps-with-required-login';
import { cancelAndRefundPurchaseAsync } from 'calypso/lib/purchases/actions';
import { isExternal } from 'calypso/lib/url';
import wpcom from 'calypso/lib/wp';
import type { SiteSelect } from '@automattic/data-stores';

const BASE_STEPS = [ STEPS.UNIFIED_PLANS ];

/**
 * Checks if the user has access to upgrade plans for the given site
 */
async function checkUserHasAccess(): Promise< boolean > {
	// Get site slug or ID from query params
	const queryParams = getCurrentQueryParams();
	const siteSlugFromQuery = queryParams.get( 'siteSlug' );
	const siteIdFromQuery = queryParams.get( 'siteId' );

	const siteIdOrSlug = siteSlugFromQuery || siteIdFromQuery;

	if ( ! siteIdOrSlug ) {
		return false;
	}

	try {
		const site = await resolveSelect( SITE_STORE ).getSite( siteIdOrSlug );

		if ( ! site ) {
			return false;
		}

		// Check if user can manage the site using the capabilities from the site object
		return site.capabilities?.manage_options === true;
	} catch ( error ) {
		return false;
	}
}

async function initialize() {
	const hasAccess = await checkUserHasAccess();

	if ( ! hasAccess ) {
		window.location.assign( '/' );
		return false;
	}

	return stepsWithRequiredLogin( BASE_STEPS );
}

const planUpgradeFlow: FlowV2< typeof initialize > = {
	name: PLAN_UPGRADE_FLOW,
	title: __( 'Upgrade plan' ),
	isSignupFlow: false,
	__experimentalUseSessions: true,
	__experimentalUseBuiltinAuth: true,
	initialize,

	useStepsProps() {
		const query = useQuery();
		const selectedFeature = query.get( 'feature' ) ?? undefined;
		const backTo = query.get( 'back_to' ) ?? query.get( 'cancel_to' ) ?? undefined;

		// Validate back_to to prevent open redirect - must not be external (expect for allowed origins).
		const isValidBackTo = dashboardOrigins().some( ( origin ) => backTo?.startsWith( origin ) );
		const safeBackTo =
			backTo && ( ! isExternal( backTo ) || isValidBackTo ) ? backTo : dashboardLink( '/sites' );

		const isSwitchPlan = query.get( 'switch_plan' ) === 'true';

		// Resolve the user's current billing term so we can lock the grid to same-period plans.
		const siteIdOrSlug = query.get( 'siteSlug' ) || query.get( 'siteId' );
		const site = useSelect(
			( select ) => {
				if ( ! siteIdOrSlug ) {
					return null;
				}
				return ( select( SITE_STORE ) as SiteSelect ).getSite( siteIdOrSlug );
			},
			[ siteIdOrSlug ]
		);
		const currentTerm = Plans.useCurrentPlanTerm( { siteId: site?.ID } );
		const currentIntervalType = currentTerm
			? ( getIntervalTypeForTerm( currentTerm ) as
					| 'monthly'
					| 'yearly'
					| '2yearly'
					| '3yearly'
					| null )
			: null;

		return {
			[ STEPS.UNIFIED_PLANS.slug ]: {
				// Note that this step uses this flow name to select the `plans-upgrade` intent.

				// This flag enables upgrade-specific behavior in PlansFeaturesMain
				isStepperUpgradeFlow: true,

				// This is NOT a signup flow - use logged-in behavior for current plans
				isInSignup: false,

				// Pass the feature parameter for feature-based plan filtering
				selectedFeature,

				// When switching plans from the cancel flow, hide Free and Enterprise tiers
				// and lock the grid to the user's current billing period.
				...( isSwitchPlan && {
					hideFreePlan: true,
					hideEnterprisePlan: true,
				} ),
				...( isSwitchPlan &&
					currentIntervalType && {
						hidePlanTypeSelector: true,
						intervalType: currentIntervalType,
						displayedIntervals: [ currentIntervalType ],
					} ),

				// Provide a custom back handler that goes to back_to or /sites
				wrapperProps: {
					goBack: () => {
						window.location.assign( safeBackTo );
					},
				},
			},
		};
	},

	useStepNavigation() {
		const query = useQuery();
		const siteSlug = query.get( 'siteSlug' );
		const redirectTo = query.get( 'redirect_to' );
		const purchaseId = query.get( 'purchaseId' );
		const site = useSelect(
			( select ) => {
				if ( ! siteSlug ) {
					return null;
				}
				return ( select( SITE_STORE ) as SiteSelect ).getSite( siteSlug );
			},
			[ siteSlug ]
		);
		const currentPlan = Plans.useCurrentPlan( { siteId: site?.ID } );
		const currentPlanSlug = currentPlan?.planSlug;

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.UNIFIED_PLANS.slug: {
					// User selected plan, go directly to checkout
					if ( providedDependencies?.cartItems && providedDependencies.cartItems.length > 0 ) {
						const selectedPlan = providedDependencies.cartItems[ 0 ]?.product_slug;
						if ( selectedPlan && siteSlug ) {
							// Detect downgrade: selected plan's availableFor doesn't include current plan
							const selectedPlanObj = getPlan( selectedPlan );
							const isDowngrade = Boolean(
								selectedPlanObj &&
									currentPlanSlug &&
									purchaseId &&
									! selectedPlanObj.availableFor?.( currentPlanSlug )
							);

							if ( isDowngrade ) {
								const targetProductId = selectedPlanObj?.getProductId();
								if ( targetProductId && purchaseId ) {
									const fallbackDestination = redirectTo || dashboardLink( '/sites' );
									const planTitle = String( selectedPlanObj?.getTitle() ?? '' );

									// Downgrade: fetch old purchase for refund info, fire mutation,
									// then fetch fresh purchases to find the new subscription and redirect.
									( async () => {
										const isFromDashboard = redirectTo
											? dashboardOrigins().some( ( origin ) => redirectTo.startsWith( origin ) )
											: false;
										try {
											// Step 1: Fetch old purchase for refund info
											const purchases: Array< {
												ID: number | string;
												blog_id: number;
												product_id: number;
												is_refundable: boolean;
												refund_options: Array< {
													to_product_id: number;
													refund_amount: number;
													refund_currency_symbol: string;
												} > | null;
											} > = await wpcom.req.get( {
												path: '/me/purchases',
												apiVersion: '1.1',
											} );

											const oldPurchase = purchases.find(
												( p ) => String( p.ID ) === String( purchaseId )
											);
											const matchingRefund =
												oldPurchase?.is_refundable && Array.isArray( oldPurchase.refund_options )
													? oldPurchase.refund_options.find(
															( o ) => o.to_product_id === targetProductId
													  )
													: null;

											// Step 2: Fire the downgrade mutation
											const response = await cancelAndRefundPurchaseAsync(
												parseInt( purchaseId, 10 ),
												{
													type: 'downgrade' as const,
													to_product_id: targetProductId,
												}
											);

											// Step 3: Build success params
											const params: Record< string, string > = {
												downgraded: 'true',
												plan: planTitle,
											};
											if ( matchingRefund && matchingRefund.refund_amount > 0 ) {
												params.refund = String( matchingRefund.refund_amount );
												params.currency = matchingRefund.refund_currency_symbol;
											}

											// Step 4: Read the new subscription ID straight from the mutation response.
											// The sandbox patch on `update/downgrade-return-subscription-id` (commit 880584429707)
											// bubbles this through migrate_sub_for_downgrade → downgrade → request_cancel.
											const newSubscriptionId = (
												response as { new_subscription_id?: string | number }
											 )?.new_subscription_id;

											// Step 5: Redirect to the appropriate surface.
											if ( newSubscriptionId ) {
												if ( ! isFromDashboard && siteSlug ) {
													// Legacy: verify the new subscription is visible in the
													// v1.2 endpoint before navigating, to avoid the
													// manage-purchase page bouncing to /me/purchases (the list)
													// when getByPurchaseId returns undefined.
													for ( let attempt = 1; attempt <= 3; attempt++ ) {
														const freshPurchases: Array< {
															ID: number | string;
														} > = await wpcom.req.get( {
															path: '/me/purchases',
															apiVersion: '1.2',
														} );
														const found = freshPurchases.some(
															( p ) => String( p.ID ) === String( newSubscriptionId )
														);

														if ( found ) {
															break;
														}
														if ( attempt < 3 ) {
															await new Promise( ( r ) => setTimeout( r, 500 ) );
														}
													}

													const targetUrl = addQueryArgs(
														'/me/purchases/' +
															encodeURIComponent( siteSlug ) +
															'/' +
															String( newSubscriptionId ),
														params
													);
													window.location.assign( targetUrl );
												} else {
													const targetUrl = addQueryArgs(
														dashboardLink( '/me/billing/purchases/' + String( newSubscriptionId ) ),
														params
													);
													window.location.assign( targetUrl );
												}
											} else {
												// Fallback: API didn't return new_subscription_id (sandbox patch not deployed?)
												const fallbackUrl = addQueryArgs( fallbackDestination, params );
												window.location.assign( fallbackUrl );
											}
										} catch ( error ) {
											// Redirect back to the old plan's purchase settings with
											// an error notice so the user can retry or contact support.
											const errorUrl = isFromDashboard
												? dashboardLink( '/me/billing/purchases/' + purchaseId )
												: '/me/purchases/' + encodeURIComponent( siteSlug ) + '/' + purchaseId;
											window.location.assign(
												addQueryArgs( errorUrl, {
													downgrade_failed: 'true',
												} )
											);
										}
									} )();
									return;
								}
							}

							const checkoutUrl = `/checkout/${ encodeURIComponent( siteSlug ) }/${ selectedPlan }`;
							const currentPath = window.location.href.replace( window.location.origin, '' );

							// Build checkout URL with query params
							// Note: Not using goToCheckout utility because it hardcodes signup=1
							// Checkout validates redirect_to to prevent open redirects
							const finalUrl = addQueryArgs( checkoutUrl, {
								redirect_to: redirectTo || dashboardLink( '/sites' ),
								cancel_to: currentPath,
							} );

							window.location.assign( finalUrl );
						}
						return;
					}

					// If no cart items, something went wrong - redirect to sites
					window.location.assign( dashboardLink( '/sites' ) );
					break;
				}
			}
		};

		return { submit };
	},
};

export default planUpgradeFlow;
