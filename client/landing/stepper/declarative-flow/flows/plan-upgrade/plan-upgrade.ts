import { getPlan } from '@automattic/calypso-products';
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
				...( isSwitchPlan && {
					hideFreePlan: true,
					hideEnterprisePlan: true,
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
		const cancelTo = query.get( 'cancel_to' );

		const site = useSelect(
			( select ) => {
				if ( ! siteSlug ) {
					return null;
				}
				return select( SITE_STORE ).getSite( siteSlug );
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
									const isDashboard = cancelTo?.includes( '/me/billing/' );

									// Downgrade: fetch old purchase for refund info, fire mutation,
									// then redirect to the new plan's purchase settings.
									( async () => {
										try {
											// eslint-disable-next-line no-console
											console.warn( '[plan-downgrade] starting', {
												purchaseId,
												targetProductId,
												planTitle,
												siteId: site?.ID,
											} );

											const purchases: Array< {
												ID: number;
												product_id: number;
												blog_id: number;
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
												( p ) => p.ID === parseInt( purchaseId, 10 )
											);
											const matchingRefund =
												oldPurchase?.is_refundable && Array.isArray( oldPurchase.refund_options )
													? oldPurchase.refund_options.find(
															( o ) => o.to_product_id === targetProductId
													  )
													: null;

											// eslint-disable-next-line no-console
											console.warn( '[plan-downgrade] old purchase', {
												found: !! oldPurchase,
												isRefundable: oldPurchase?.is_refundable,
												matchingRefund,
											} );

											const mutationResponse = await cancelAndRefundPurchaseAsync(
												parseInt( purchaseId, 10 ),
												{
													type: 'downgrade' as const,
													to_product_id: targetProductId,
												}
											);

											// eslint-disable-next-line no-console
											console.warn( '[plan-downgrade] mutation response', mutationResponse );

											// Try to find the new purchase (retry once after 2s if not found)
											let newPurchase: {
												ID: number;
												product_id: number;
												blog_id: number;
											} | null = null;

											for ( let attempt = 0; attempt < 2; attempt++ ) {
												if ( attempt > 0 ) {
													await new Promise( ( resolve ) => setTimeout( resolve, 2000 ) );
												}
												const freshPurchases: Array< {
													ID: number;
													product_id: number;
													blog_id: number;
												} > = await wpcom.req.get( {
													path: '/me/purchases',
													apiVersion: '1.1',
												} );
												newPurchase =
													freshPurchases.find(
														( p ) => p.product_id === targetProductId && p.blog_id === site?.ID
													) ?? null;

												// eslint-disable-next-line no-console
												console.warn( `[plan-downgrade] attempt ${ attempt + 1 }`, {
													freshCount: freshPurchases.length,
													found: !! newPurchase,
												} );

												if ( newPurchase ) {
													break;
												}
											}

											const params: Record< string, string > = {
												downgraded: 'true',
												plan: planTitle,
											};
											if ( matchingRefund && matchingRefund.refund_amount > 0 ) {
												params.refund = String( matchingRefund.refund_amount );
												params.currency = matchingRefund.refund_currency_symbol;
											}

											if ( newPurchase ) {
												const basePath = isDashboard
													? dashboardLink( '/me/billing/purchases/' + newPurchase.ID )
													: `/me/purchases/${ siteSlug }/${ newPurchase.ID }`;
												window.location.assign( addQueryArgs( basePath, params ) );
											} else {
												window.location.assign( addQueryArgs( fallbackDestination, params ) );
											}
										} catch ( error ) {
											// eslint-disable-next-line no-console
											console.warn( '[plan-downgrade] error:', error );
											window.location.assign( fallbackDestination );
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
