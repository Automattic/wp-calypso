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
import { isRefundable } from 'calypso/lib/purchases';
import { isExternal } from 'calypso/lib/url';
import { useSelector } from 'calypso/state';
import { getByPurchaseId } from 'calypso/state/purchases/selectors';
import { performPlanSwitch } from './perform-plan-switch';
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

				// When switching plans from the cancel flow, hide Free and Enterprise
				// tiers and always hide the term picker — the grid is locked to the
				// user's current billing period (set below once it's resolved).
				...( isSwitchPlan && {
					hideFreePlan: true,
					hideEnterprisePlan: true,
					hidePlanTypeSelector: true,
				} ),
				...( isSwitchPlan &&
					currentIntervalType && {
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
		// Loaded into Redux by the step's QueryUserPurchases; used to quote the
		// refund amount in the downgrade success notice.
		const switchPurchase = useSelector( ( state ) =>
			purchaseId ? getByPurchaseId( state, parseInt( purchaseId, 10 ) ) : undefined
		);

		const submit: SubmitHandler< typeof initialize > = ( submittedStep ) => {
			const { slug, providedDependencies } = submittedStep;

			switch ( slug ) {
				case STEPS.UNIFIED_PLANS.slug: {
					if ( providedDependencies?.cartItems && providedDependencies.cartItems.length > 0 ) {
						const selectedPlan = providedDependencies.cartItems[ 0 ]?.product_slug;
						if ( selectedPlan && siteSlug ) {
							// Detect a downgrade: the selected plan isn't available as a purchase
							// from the current plan. Downgrades are processed inline via a mutation
							// rather than sent to checkout.
							const selectedPlanObj = getPlan( selectedPlan );
							const targetProductId = selectedPlanObj?.getProductId();
							const isDowngrade = Boolean(
								selectedPlanObj &&
									currentPlanSlug &&
									purchaseId &&
									targetProductId &&
									! selectedPlanObj.availableFor?.( currentPlanSlug )
							);

							if ( isDowngrade && targetProductId && purchaseId ) {
								const matchingRefund =
									switchPurchase &&
									isRefundable( switchPurchase ) &&
									Array.isArray( switchPurchase.refundOptions )
										? switchPurchase.refundOptions.find(
												( option ) => option.to_product_id === targetProductId
										  )
										: null;

								performPlanSwitch( {
									purchaseId: parseInt( purchaseId, 10 ),
									targetProductId,
									siteSlug,
									redirectTo,
									refund: matchingRefund
										? {
												amount: matchingRefund.refund_amount,
												currencySymbol: matchingRefund.refund_currency_symbol,
										  }
										: null,
								} );
								return;
							}

							// Otherwise this is an upgrade — send the user to checkout.
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
