import {
	PLAN_MONTHLY_PERIOD,
	type PlanSlug,
	getTermFromDuration,
	calculateMonthlyPrice,
} from '@automattic/calypso-products';
import { useSelect } from '@wordpress/data';
import * as Plans from '../';
import * as AddOns from '../../add-ons';
import * as Purchases from '../../purchases';
import * as WpcomPlansUI from '../../wpcom-plans-ui';
import { COST_OVERRIDE_REASONS } from '../constants';

export type UseCheckPlanAvailabilityForPurchase = ( {
	planSlugs,
	siteId,
	shouldIgnorePlanOwnership,
}: {
	planSlugs: PlanSlug[];
	siteId?: number | null;
	shouldIgnorePlanOwnership?: boolean;
} ) => {
	[ planSlug in PlanSlug ]?: boolean;
};

interface Props {
	planSlugs: PlanSlug[];

	/**
	 * `siteId` required on purpose to mitigate risk with not passing something through when we should
	 */
	siteId: number | null | undefined;

	/**
	 * `coupon` required on purpose to mitigate risk with not passing somethiing through when we should
	 */
	coupon: string | undefined;

	/**
	 * `useCheckPlanAvailabilityForPurchase` required on purpose to avoid inconsistent data across Calypso.
	 *     - It returns an index of planSlugs and whether they are available for purchase (non-available plans
	 * will not have the discounted prices attached).
	 *     - It's a function that is not available in the data store, but can be easily mocked in other contexts.
	 *     - For Calypso instances, this should be the same function. So find other/existing cases and import the same.
	 */
	useCheckPlanAvailabilityForPurchase: UseCheckPlanAvailabilityForPurchase;

	/**
	 * Whether to include discounts from plan proration.
	 * This is applicable only if a siteId is passed to this hook.
	 * If true, the pricing includes discounts from upgrade credits.
	 */
	withProratedDiscounts?: boolean;

	/**
	 * Storage add-on products ( e.g. increase site storage by 50GB ) can be purchased alongside plans. If true,
	 * storage add-on selections will be included in final plan price calculations. Otherwise, omit the add-ons
	 * from the final price.
	 */
	reflectStorageSelectionInPlanPrices?: boolean;
}

function getTotalPrice( planPrice: number | null | undefined, addOnPrice = 0 ): number | null {
	return null !== planPrice && undefined !== planPrice ? planPrice + addOnPrice : null;
}

/**
 * This hook is a re-projection of the the pricing metadata derived from `usePlans` and `useSitePlans` hooks.
 * It returns the pricing metadata as needed for the Calypso grid components, which may be adjusted based on the selected site,
 * storage add-ons, current plan (will use the actual purchase price for `originalPrice` in this case), etc.
 *
 * For most uses within Calypso (e.g. pricing grids), this should work. However, if you need to access the pricing metadata directly,
 * you should use the `usePlans` and `useSitePlans` hooks instead.
 *
 * Check the properties, incode docs (numbered set of cases), and `PricingMetaForGridPlan` type for additional details.
 */
const usePricingMetaForGridPlans = ( {
	planSlugs,
	siteId,
	coupon,
	useCheckPlanAvailabilityForPurchase,
	withProratedDiscounts,
	reflectStorageSelectionInPlanPrices = false,
}: Props ): { [ planSlug: string ]: Plans.PricingMetaForGridPlan } | null => {
	// plans - should have a definition for all plans, being the main source of API data
	const plans = Plans.usePlans( { coupon } );
	// sitePlans - unclear if all plans are included
	const sitePlans = Plans.useSitePlans( { coupon, siteId } );
	const storageAddOns = AddOns.useStorageAddOns( { siteId } );
	const currentPlan = Plans.useCurrentPlan( { siteId } );
	const introOffers = Plans.useIntroOffers( { siteId, coupon } );
	const purchasedPlan = Purchases.useSitePurchaseById( {
		siteId,
		purchaseId: currentPlan?.purchaseId,
	} );
	const selectedStorageOptions = useSelect(
		( select ) => select( WpcomPlansUI.store ).getSelectedStorageOptions( siteId ),
		[]
	);

	const planAvailabilityForPurchase = useCheckPlanAvailabilityForPurchase( {
		planSlugs,
		siteId,

		// TODO:
		// We need to ignore plan ownership only if the site is on a paid plan so the CTAs are enabled for non-owner actions.
		// See https://github.com/Automattic/wp-calypso/issues/87479 for more details.
		// However, it's technically "not available for purchase for the current user", so it'd be better if the state
		// can express it more explicitly.
		shouldIgnorePlanOwnership: !! currentPlan?.purchaseId,
	} );

	let planPrices:
		| {
				[ planSlug in PlanSlug ]?: {
					originalPrice: Plans.PlanPricing[ 'originalPrice' ];
					discountedPrice: Plans.PlanPricing[ 'discountedPrice' ];
					currencyCode: Plans.PlanPricing[ 'currencyCode' ];
					introOffer: Plans.PlanPricing[ 'introOffer' ];
				};
		  }
		| null = null;

	if ( ( siteId && sitePlans.isLoading ) || plans.isLoading ) {
		/**
		 * Null until all data is ready, at least in initial state.
		 * - For now a simple loader is shown until these are resolved
		 * - `sitePlans` being a dependent query will only get fetching status when enabled (when `selectedSiteId` exists)
		 */
		planPrices = null;
	} else {
		planPrices = Object.fromEntries(
			planSlugs.map( ( planSlug ) => {
				const plan = plans.data?.[ planSlug ];
				const sitePlan = sitePlans.data?.[ planSlug ];
				const selectedStorageOption = selectedStorageOptions?.[ planSlug ];
				const selectedStorageAddOn =
					selectedStorageOption && reflectStorageSelectionInPlanPrices
						? storageAddOns?.find( ( addOn ) => {
								return addOn?.addOnSlug === selectedStorageOption;
						  } )
						: null;
				const storageAddOnPriceMonthly = selectedStorageAddOn?.prices?.monthlyPrice || 0;
				const storageAddOnPriceYearly = selectedStorageAddOn?.prices?.yearlyPrice || 0;

				const introOffer = introOffers?.[ planSlug ];

				const introOfferPrice = introOffer
					? ( {
							monthly: introOffer.rawPrice.monthly + storageAddOnPriceMonthly,
							full:
								introOffer.rawPrice.full +
								( 'year' === introOffer.intervalUnit ? storageAddOnPriceYearly : 0 ),
					  } as const )
					: undefined;

				/**
				 * 0. No plan or sitePlan (when selected site exists): planSlug is for a priceless plan.
				 * TODO clk: the condition on `.pricing` here needs investigation. There should be a pricing object for all returned API plans.
				 */
				if ( ! plan?.pricing || ( siteId && ! sitePlan?.pricing ) ) {
					return [
						planSlug,
						{
							originalPrice: {
								monthly: null,
								full: null,
							},
							discountedPrice: {
								monthly: null,
								full: null,
							},
							currencyCode: plans.data?.[ planSlug ]?.pricing?.currencyCode,
						},
					];
				}

				/**
				 * 1. Original prices only for current site's plan.
				 *   - The current site's plan gets the price with which the plan was purchased
				 *     (so may not be the most recent billing plan's).
				 */
				if ( siteId && currentPlan?.planSlug === planSlug ) {
					let monthlyPrice = sitePlan?.pricing.originalPrice.monthly;
					let fullPrice = sitePlan?.pricing.originalPrice.full;

					/**
					 * Ensure the spotlight (current) plan shows the price with which the plan was purchased.
					 */
					if ( purchasedPlan ) {
						const isMonthly = purchasedPlan.billPeriodDays === PLAN_MONTHLY_PERIOD;

						if ( isMonthly && monthlyPrice !== purchasedPlan.priceInteger ) {
							monthlyPrice = purchasedPlan.priceInteger;
							fullPrice = parseFloat( ( purchasedPlan.priceInteger * 12 ).toFixed( 2 ) );
						} else if ( fullPrice !== purchasedPlan.priceInteger ) {
							const term = getTermFromDuration( purchasedPlan.billPeriodDays ) || '';
							monthlyPrice = calculateMonthlyPrice( term, purchasedPlan.priceInteger );
							fullPrice = purchasedPlan.priceInteger;
						}
					}

					return [
						planSlug,
						{
							originalPrice: {
								monthly: getTotalPrice( monthlyPrice ?? null, storageAddOnPriceMonthly ),
								full: getTotalPrice( fullPrice ?? null, storageAddOnPriceYearly ),
							},
							discountedPrice: {
								monthly: null,
								full: null,
							},
							currencyCode: purchasedPlan
								? purchasedPlan?.currencyCode
								: plan?.pricing?.currencyCode,
						},
					];
				}

				/**
				 * 2. Original and Discounted prices for site-specific plans available for purchase
				 */
				if ( siteId && planAvailabilityForPurchase[ planSlug ] ) {
					const originalPrice = {
						monthly: getTotalPrice(
							sitePlan?.pricing.originalPrice.monthly,
							storageAddOnPriceMonthly
						),
						full: getTotalPrice( sitePlan?.pricing.originalPrice.full, storageAddOnPriceYearly ),
					};

					// Do not return discounted prices if discount is due to plan proration
					// If there is, however, a sale coupon, show the discounted price
					// without proration. This isn't ideal, but is intentional. Because of
					// this, the price will differ between the plans grid and checkout screen.
					if (
						! sitePlan?.pricing?.hasSaleCoupon &&
						! withProratedDiscounts &&
						sitePlan?.pricing?.costOverrides?.[ 0 ]?.overrideCode ===
							COST_OVERRIDE_REASONS.RECENT_PLAN_PRORATION
					) {
						return [
							planSlug,
							{
								originalPrice,
								discountedPrice: {
									monthly: null,
									full: null,
								},
								currencyCode: sitePlan?.pricing?.currencyCode,
								...( sitePlan?.pricing.introOffer && {
									introOffer: {
										...sitePlan?.pricing.introOffer,
										rawPrice: introOfferPrice,
									},
								} ),
							},
						];
					}

					const discountedPrice = {
						monthly: getTotalPrice(
							sitePlan?.pricing.discountedPrice.monthly,
							storageAddOnPriceMonthly
						),
						full: getTotalPrice( sitePlan?.pricing.discountedPrice.full, storageAddOnPriceYearly ),
					};

					return [
						planSlug,
						{
							originalPrice,
							discountedPrice,
							currencyCode: sitePlan?.pricing?.currencyCode,
							...( sitePlan?.pricing.introOffer && {
								introOffer: {
									...sitePlan?.pricing.introOffer,
									rawPrice: introOfferPrice,
								},
							} ),
						},
					];
				}

				/**
				 * 3. Original and Discounted prices for plan available for purchase.
				 */
				if ( planAvailabilityForPurchase[ planSlug ] ) {
					const originalPrice = {
						monthly: getTotalPrice( plan.pricing.originalPrice.monthly, storageAddOnPriceMonthly ),
						full: getTotalPrice( plan.pricing.originalPrice.full, storageAddOnPriceYearly ),
					};
					const discountedPrice = {
						monthly: getTotalPrice(
							plan.pricing.discountedPrice.monthly,
							storageAddOnPriceMonthly
						),
						full: getTotalPrice( plan.pricing.discountedPrice.full, storageAddOnPriceYearly ),
					};

					return [
						planSlug,
						{
							originalPrice,
							discountedPrice,
							currencyCode: plan?.pricing?.currencyCode,
							...( plan?.pricing.introOffer && {
								introOffer: {
									...plan?.pricing.introOffer,
									rawPrice: introOfferPrice,
								},
							} ),
						},
					];
				}

				/**
				 * 3. Original prices only for plan not available for purchase.
				 */
				return [
					planSlug,
					{
						originalPrice: {
							monthly: getTotalPrice(
								plan.pricing.originalPrice.monthly,
								storageAddOnPriceMonthly
							),
							full: getTotalPrice( plan.pricing.originalPrice.full, storageAddOnPriceYearly ),
						},
						discountedPrice: {
							monthly: null,
							full: null,
						},
						currencyCode: plan?.pricing?.currencyCode,
						...( plan?.pricing.introOffer && {
							introOffer: {
								...plan?.pricing.introOffer,
								rawPrice: introOfferPrice,
							},
						} ),
					},
				];
			} )
		);
	}

	return (
		// TODO: consider removing the null return
		planPrices &&
		planSlugs.reduce(
			( acc, planSlug ) => ( {
				...acc,
				[ planSlug ]: {
					originalPrice: planPrices?.[ planSlug ]?.originalPrice,
					discountedPrice: planPrices?.[ planSlug ]?.discountedPrice,
					// TODO clk: the condition on `.pricing` here needs investigation. There should be a pricing object for all returned API plans.
					billingPeriod: plans.data?.[ planSlug ]?.pricing?.billPeriod,
					// TODO clk: the condition on `.pricing` here needs investigation. There should be a pricing object for all returned API plans.
					currencyCode: planPrices?.[ planSlug ]?.currencyCode,
					expiry: sitePlans.data?.[ planSlug ]?.expiry,
					introOffer: planPrices?.[ planSlug ]?.introOffer,
				},
			} ),
			{} as { [ planSlug in PlanSlug ]?: Plans.PricingMetaForGridPlan }
		)
	);
};

export default usePricingMetaForGridPlans;
